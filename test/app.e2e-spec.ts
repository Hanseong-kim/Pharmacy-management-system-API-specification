import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TypeOrmExceptionFilter } from '../src/common/filters/typeorm-exception.filter';

// ─── DB 전체 초기화 헬퍼 ─────────────────────────────────────
async function cleanDatabase(ds: DataSource) {
  await ds.query(`
    TRUNCATE TABLE
      "prescription_medicines_medicine",
      "prescription",
      "sale_item",
      "sale",
      "medicine",
      "customer",
      "supplier",
      "staff",
      "user"
    RESTART IDENTITY CASCADE
  `);
}

// ─── 메인 E2E 테스트 ──────────────────────────────────────────
describe('Pharmacy API (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  // JWT 토큰
  let adminToken: string;
  let pharmacistToken: string;
  let staffToken: string;
  let delStaffToken: string; // SET NULL 테스트에서 삭제될 직원

  // ID 추적
  let delStaffUserId: number;
  let supplierId: number;
  let medicine1Id: number; // stock=100, 유효
  let medicine2Id: number; // stock=50, 유효
  let medicine3Id: number; // stock=5, 유효 (재고 부족 테스트용)
  let expiredMedId: number; // 만료됨
  let inactiveMedId: number; // isActive=false
  let customerId: number;
  let delCustomerId: number; // SET NULL 테스트에서 삭제될 고객
  let saleByDelStaffId: number; // SET NULL 검증용 판매
  let prescForDelCustomerId: number; // SET NULL 검증용 처방전

  const http = () => request(app.getHttpServer());
  const bearer = (token: string) => `Bearer ${token}`;

  // ── Setup: 앱 기동 + DB 초기화 + 테스트 데이터 생성 ─────────
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new TypeOrmExceptionFilter());
    await app.init();

    ds = module.get(DataSource);
    await cleanDatabase(ds);

    // ── 1. 유저 등록 ────────────────────────────────────────
    const [adminRes, pharmaRes, staffRes, delStaffRes] = await Promise.all([
      http().post('/auth/register').send({ email: 'admin@e2e.test', password: 'password123', name: '관리자', role: 'ADMIN', phoneNumber: '010-0000-0001' }),
      http().post('/auth/register').send({ email: 'pharma@e2e.test', password: 'password123', name: '약사', role: 'PHARMACIST', phoneNumber: '010-0000-0002' }),
      http().post('/auth/register').send({ email: 'staff@e2e.test', password: 'password123', name: '직원', role: 'STAFF', phoneNumber: '010-0000-0003' }),
      http().post('/auth/register').send({ email: 'delstaff@e2e.test', password: 'password123', name: '삭제직원', role: 'STAFF', phoneNumber: '010-0000-0004' }),
    ]);

    expect(adminRes.status).toBe(201);
    expect(pharmaRes.status).toBe(201);
    expect(staffRes.status).toBe(201);
    expect(delStaffRes.status).toBe(201);
    delStaffUserId = delStaffRes.body.id;

    // ── 2. 로그인 → 토큰 획득 ────────────────────────────────
    const [aLogin, pLogin, sLogin, dLogin] = await Promise.all([
      http().post('/auth/login').send({ email: 'admin@e2e.test', password: 'password123' }),
      http().post('/auth/login').send({ email: 'pharma@e2e.test', password: 'password123' }),
      http().post('/auth/login').send({ email: 'staff@e2e.test', password: 'password123' }),
      http().post('/auth/login').send({ email: 'delstaff@e2e.test', password: 'password123' }),
    ]);

    adminToken = aLogin.body.access_token;
    pharmacistToken = pLogin.body.access_token;
    staffToken = sLogin.body.access_token;
    delStaffToken = dLogin.body.access_token;

    // ── 3. 공급처 생성 ────────────────────────────────────────
    const supplierRes = await http().post('/suppliers')
      .set('Authorization', bearer(adminToken))
      .send({ name: '테스트공급처', contactEmail: 'sup@test.com', phone: '02-0000-0000' });
    expect(supplierRes.status).toBe(201);
    supplierId = supplierRes.body.id;

    // ── 4. 약품 생성 ─────────────────────────────────────────
    const [m1, m2, m3, mExp, mInact] = await Promise.all([
      http().post('/medicines').set('Authorization', bearer(adminToken)).send({ name: '타이레놀', price: 1000, stockQty: 100, expiryDate: '2027-12-31', supplierId }),
      http().post('/medicines').set('Authorization', bearer(adminToken)).send({ name: '부루펜', price: 2000, stockQty: 50, expiryDate: '2027-12-31' }),
      http().post('/medicines').set('Authorization', bearer(adminToken)).send({ name: '아스피린', price: 500, stockQty: 5, expiryDate: '2027-12-31' }),
      http().post('/medicines').set('Authorization', bearer(adminToken)).send({ name: '만료약', price: 100, stockQty: 100, expiryDate: '2020-01-01' }),
      http().post('/medicines').set('Authorization', bearer(adminToken)).send({ name: '비활성약', price: 100, stockQty: 100, expiryDate: '2027-12-31' }),
    ]);

    medicine1Id = m1.body.id;
    medicine2Id = m2.body.id;
    medicine3Id = m3.body.id;
    expiredMedId = mExp.body.id;
    inactiveMedId = mInact.body.id;

    // 비활성약 soft delete
    await http().delete(`/medicines/${inactiveMedId}`).set('Authorization', bearer(adminToken));

    // ── 5. 고객 생성 ─────────────────────────────────────────
    const [custRes, delCustRes] = await Promise.all([
      http().post('/customers').set('Authorization', bearer(adminToken)).send({ name: '홍길동', email: 'hong@e2e.test', phone: '010-1111-1111' }),
      http().post('/customers').set('Authorization', bearer(adminToken)).send({ name: '삭제고객', email: 'delcust@e2e.test' }),
    ]);
    customerId = custRes.body.id;
    delCustomerId = delCustRes.body.id;

    // ── 6. SET NULL 테스트용 데이터 생성 ──────────────────────
    // 삭제될 직원이 만든 판매 (medicine1 1개)
    const delStaffSale = await http().post('/sales')
      .set('Authorization', bearer(delStaffToken))
      .send({ items: [{ medicineId: medicine1Id, quantity: 1 }] });
    expect(delStaffSale.status).toBe(201);
    saleByDelStaffId = delStaffSale.body.id;

    // 삭제될 고객의 처방전
    const delCustPrsc = await http().post('/prescriptions')
      .set('Authorization', bearer(adminToken))
      .send({ customerId: delCustomerId, doctorName: '김의사', issuedDate: '2025-01-01', medicineIds: [medicine2Id] });
    expect(delCustPrsc.status).toBe(201);
    prescForDelCustomerId = delCustPrsc.body.id;
  }, 60000);

  afterAll(async () => {
    await cleanDatabase(ds);
    await app.close();
  }, 15000);

  // ══════════════════════════════════════════════════════════════
  // 1. 인증 & 권한 (Auth & RBAC)
  // ══════════════════════════════════════════════════════════════
  describe('1. Auth & RBAC', () => {
    it('잘못된 비밀번호 로그인 → 401', async () => {
      const res = await http().post('/auth/login').send({ email: 'admin@e2e.test', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('토큰 없이 보호된 엔드포인트 접근 → 401', async () => {
      const res = await http().get('/medicines');
      expect(res.status).toBe(401);
    });

    it('유효하지 않은 토큰 사용 → 401', async () => {
      const res = await http().get('/medicines').set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('STAFF 역할이 약품 생성 시도 → 403', async () => {
      const res = await http().post('/medicines')
        .set('Authorization', bearer(staffToken))
        .send({ name: '무단약', price: 100, stockQty: 10, expiryDate: '2027-01-01' });
      expect(res.status).toBe(403);
    });

    it('STAFF 역할이 약품 삭제 시도 → 403', async () => {
      const res = await http().delete(`/medicines/${medicine2Id}`)
        .set('Authorization', bearer(staffToken));
      expect(res.status).toBe(403);
    });

    it('PHARMACIST 역할이 약품 생성 → 201', async () => {
      const res = await http().post('/medicines')
        .set('Authorization', bearer(pharmacistToken))
        .send({ name: '약사생성약', price: 100, stockQty: 10, expiryDate: '2027-01-01' });
      expect(res.status).toBe(201);
      // 정리 (soft delete)
      await http().delete(`/medicines/${res.body.id}`).set('Authorization', bearer(adminToken));
    });

    it('ADMIN 역할이 약품 생성 → 201', async () => {
      const res = await http().post('/medicines')
        .set('Authorization', bearer(adminToken))
        .send({ name: '어드민생성약', price: 200, stockQty: 20, expiryDate: '2027-01-01' });
      expect(res.status).toBe(201);
      await http().delete(`/medicines/${res.body.id}`).set('Authorization', bearer(adminToken));
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 2. 재고 & 공급처 (Inventory & Supplier)
  // ══════════════════════════════════════════════════════════════
  describe('2. Inventory & Supplier', () => {
    it('존재하지 않는 supplierId로 약품 등록 → 404', async () => {
      const res = await http().post('/medicines')
        .set('Authorization', bearer(adminToken))
        .send({ name: '유령약', price: 100, stockQty: 10, expiryDate: '2027-01-01', supplierId: 9999 });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('공급처');
    });

    it('약품 삭제 → isActive=false (Soft Delete, DB에서 제거되지 않음)', async () => {
      const createRes = await http().post('/medicines')
        .set('Authorization', bearer(adminToken))
        .send({ name: '소프트삭제테스트', price: 100, stockQty: 10, expiryDate: '2027-01-01' });
      expect(createRes.status).toBe(201);
      const id = createRes.body.id;

      await http().delete(`/medicines/${id}`).set('Authorization', bearer(adminToken));

      const getRes = await http().get(`/medicines/${id}`).set('Authorization', bearer(adminToken));
      expect(getRes.status).toBe(200);
      expect(getRes.body.isActive).toBe(false);
    });

    it('공급처 단건 조회 → medicines 배열 포함', async () => {
      const res = await http().get(`/suppliers/${supplierId}`)
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.medicines)).toBe(true);
      expect(res.body.medicines.some((m: any) => m.id === medicine1Id)).toBe(true);
    });

    it('존재하지 않는 약품 조회 → 404', async () => {
      const res = await http().get('/medicines/9999').set('Authorization', bearer(adminToken));
      expect(res.status).toBe(404);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 3. 판매 & 트랜잭션 (Sales & Stock)
  // ══════════════════════════════════════════════════════════════
  describe('3. Sales & Stock', () => {
    it('2종 약품 판매 → 각 재고 정확히 차감', async () => {
      const m2Before = Number((await http().get(`/medicines/${medicine2Id}`).set('Authorization', bearer(adminToken))).body.stockQty);
      const m3Before = Number((await http().get(`/medicines/${medicine3Id}`).set('Authorization', bearer(adminToken))).body.stockQty);

      const res = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ customerId, items: [{ medicineId: medicine2Id, quantity: 3 }, { medicineId: medicine3Id, quantity: 2 }] });
      expect(res.status).toBe(201);

      const m2After = Number((await http().get(`/medicines/${medicine2Id}`).set('Authorization', bearer(adminToken))).body.stockQty);
      const m3After = Number((await http().get(`/medicines/${medicine3Id}`).set('Authorization', bearer(adminToken))).body.stockQty);

      expect(m2After).toBe(m2Before - 3);
      expect(m3After).toBe(m3Before - 2);
    });

    it('재고 부족 시 → 400 + 트랜잭션 롤백 (재고 불변)', async () => {
      const stockBefore = Number((await http().get(`/medicines/${medicine3Id}`).set('Authorization', bearer(adminToken))).body.stockQty);

      const res = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ items: [{ medicineId: medicine3Id, quantity: 9999 }] });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('재고');

      const stockAfter = Number((await http().get(`/medicines/${medicine3Id}`).set('Authorization', bearer(adminToken))).body.stockQty);
      expect(stockAfter).toBe(stockBefore); // 롤백 확인
    });

    it('만료된 약품 판매 시도 → 400', async () => {
      const res = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ items: [{ medicineId: expiredMedId, quantity: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('만료');
    });

    it('비활성(isActive=false) 약품 판매 시도 → 400', async () => {
      const res = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ items: [{ medicineId: inactiveMedId, quantity: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('비활성');
    });

    it('판매 취소(CANCELLED) → 차감된 재고 복원', async () => {
      const stockBefore = Number((await http().get(`/medicines/${medicine1Id}`).set('Authorization', bearer(adminToken))).body.stockQty);

      // 새 판매 생성 (medicine1 10개)
      const saleRes = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ items: [{ medicineId: medicine1Id, quantity: 10 }] });
      expect(saleRes.status).toBe(201);
      const saleId = saleRes.body.id;

      const stockAfterSale = Number((await http().get(`/medicines/${medicine1Id}`).set('Authorization', bearer(adminToken))).body.stockQty);
      expect(stockAfterSale).toBe(stockBefore - 10);

      // 판매 취소
      const cancelRes = await http().patch(`/sales/${saleId}`)
        .set('Authorization', bearer(adminToken))
        .send({ status: 'CANCELLED' });
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.status).toBe('CANCELLED');

      // 재고 복원 확인
      const stockAfterCancel = Number((await http().get(`/medicines/${medicine1Id}`).set('Authorization', bearer(adminToken))).body.stockQty);
      expect(stockAfterCancel).toBe(stockBefore);
    });

    it('GET /sales/:id → 아이템 및 약품 상세 포함', async () => {
      const res = await http().get(`/sales/${saleByDelStaffId}`)
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items[0].medicine).toBeDefined();
    });

    it('GET /sales?status=COMPLETED → 상태 필터 정상 작동', async () => {
      const res = await http().get('/sales?status=COMPLETED')
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.every((s: any) => s.status === 'COMPLETED')).toBe(true);
    });

    it('이미 취소된 판매 재취소 시도 → 400', async () => {
      // 판매 생성 후 취소
      const saleRes = await http().post('/sales')
        .set('Authorization', bearer(staffToken))
        .send({ items: [{ medicineId: medicine2Id, quantity: 1 }] });
      const saleId = saleRes.body.id;
      await http().patch(`/sales/${saleId}`).set('Authorization', bearer(adminToken)).send({ status: 'CANCELLED' });

      // 재취소 시도
      const retryRes = await http().patch(`/sales/${saleId}`)
        .set('Authorization', bearer(adminToken))
        .send({ status: 'CANCELLED' });
      expect(retryRes.status).toBe(400);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 4. 데이터 무결성 (SET NULL)
  // ══════════════════════════════════════════════════════════════
  describe('4. Data Integrity (SET NULL)', () => {
    it('판매 기록이 있는 유저 삭제 → 500 없이 성공 + sale.staff = null', async () => {
      const deleteRes = await http().delete(`/users/${delStaffUserId}`)
        .set('Authorization', bearer(adminToken));
      expect(deleteRes.status).toBe(200);

      // 해당 직원의 판매 기록 조회 → staff 필드가 null
      const saleRes = await http().get(`/sales/${saleByDelStaffId}`)
        .set('Authorization', bearer(adminToken));
      expect(saleRes.status).toBe(200);
      expect(saleRes.body.staff).toBeNull();
    });

    it('처방전이 있는 고객 삭제 → 500 없이 성공 + prescription.customer = null', async () => {
      const deleteRes = await http().delete(`/customers/${delCustomerId}`)
        .set('Authorization', bearer(adminToken));
      expect(deleteRes.status).toBe(200);

      // 해당 고객의 처방전 조회 → customer 필드가 null
      const prescRes = await http().get(`/prescriptions/${prescForDelCustomerId}`)
        .set('Authorization', bearer(adminToken));
      expect(prescRes.status).toBe(200);
      expect(prescRes.body.customer).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 5. 페이지네이션 & 정렬
  // ══════════════════════════════════════════════════════════════
  describe('5. Pagination & Sorting', () => {
    it('GET /medicines?page=1&limit=2 → pagination 메타데이터 정확', async () => {
      const res = await http().get('/medicines?page=1&limit=2')
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ page: 1, limit: 2, total: expect.any(Number), totalPages: expect.any(Number) });
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.totalPages).toBe(Math.ceil(res.body.total / 2));
    });

    it('GET /medicines?sortBy=price&order=ASC&isActive=true → 가격 오름차순 정렬 확인', async () => {
      const res = await http().get('/medicines?sortBy=price&order=ASC&isActive=true')
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      const prices = res.body.data.map((m: any) => Number(m.price));
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it('GET /medicines?isActive=true → isActive=true인 약품만 반환', async () => {
      const res = await http().get('/medicines?isActive=true')
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.isActive === true)).toBe(true);
    });

    it('GET /medicines?supplierId=X → 해당 공급처 약품만 반환', async () => {
      const res = await http().get(`/medicines?supplierId=${supplierId}`)
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.supplier?.id === supplierId)).toBe(true);
    });

    it('GET /users → pagination 메타데이터 포함', async () => {
      const res = await http().get('/users').set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ page: 1, limit: 10, total: expect.any(Number), totalPages: expect.any(Number) });
    });

    it('GET /sales?dateFrom=2020-01-01&dateTo=2099-12-31 → 날짜 범위 필터 작동', async () => {
      const res = await http().get('/sales?dateFrom=2020-01-01&dateTo=2099-12-31')
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /prescriptions?customerId=X → 해당 고객 처방전만 반환', async () => {
      // 새 처방전 등록
      const prscRes = await http().post('/prescriptions')
        .set('Authorization', bearer(adminToken))
        .send({ customerId, doctorName: '이의사', issuedDate: '2025-06-01' });
      expect(prscRes.status).toBe(201);

      const res = await http().get(`/prescriptions?customerId=${customerId}`)
        .set('Authorization', bearer(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      // customer가 null이 아닌 처방전은 모두 해당 고객 ID여야 함
      const withCustomer = res.body.data.filter((p: any) => p.customer !== null);
      expect(withCustomer.every((p: any) => p.customer.id === customerId)).toBe(true);
    });
  });
});
