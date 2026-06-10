const request = require("supertest");
const app = require("../server");
const db = require("../config/db");

describe("การทดสอบระบบแจ้งซ่อม (IT Helpdesk API)", () => {
  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it("ควรตอบกลับด้วย 403 Forbidden ถ้าเรียกดูตั๋วโดยไม่มี Token", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(403);
  });

  it("ควรตอบกลับด้วย 400 Bad Request ถ้าส่งตั๋วแจ้งซ่อมแบบไม่มีหัวข้อหรือรายละเอียด", async () => {
    const res = await request(app).post("/api/tickets").send({
      title: "",
      description: "",
    });

    expect([400, 403]).toContain(res.statusCode);
  });
});
