const request = require("supertest");
const app = require("../server");
const db = require("../config/db");

describe("การทดสอบระบบแจ้งซ่อมแบบครบวงจร (Integration Test)", () => {
  let authToken = "";

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      employee_id: "EMP-001",
      password: "123456",
    });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it("ควรสร้างตั๋วสำเร็จด้วยรหัส 201 เมื่อมี Token", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "เทสต์", description: "ระบบทดสอบ" });

    expect(res.statusCode).toBe(201);
  });

  it("ควรดึงข้อมูลตั๋วหน้า 1 จำนวน 5 ใบได้สำเร็จ (Pagination)", async () => {
    const res = await request(app)
      .get("/api/tickets?page=1&limit=5")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tickets.length).toBeLessThanOrEqual(5);
  });
});
