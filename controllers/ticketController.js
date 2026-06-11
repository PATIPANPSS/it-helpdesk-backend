const db = require("../config/db");

exports.createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    const requester_id = req.user.id;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วน" });
    }

    const ticket_no = `REQ-${Date.now()}`;

    const sql =
      "INSERT INTO tickets (ticket_no, title, description, requester_id) VALUES (?, ?, ?, ?)";

    const values = [ticket_no, title, description, requester_id];

    await db.query(sql, values);

    res.status(201).json({
      message: "ส่งเรื่องแจ้งซ่อมสำเร็จ",
      ticket_no: ticket_no,
    });
  } catch (error) {
    console.error("ระบบแจ้งซ่อมขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.getAllTicket = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    let sql = "";
    let values = [];

    if (userRole === "it_support" || userRole === "admin") {
      sql = `SELECT tickets.*, users.employee_id 
        FROM tickets 
        LEFT JOIN users ON tickets.requester_id = users.id 
        ORDER BY tickets.created_at DESC LIMIT ? OFFSET ?`;
      values = [limit, offset];
    } else {
      sql = `SELECT tickets.*, users.employee_id 
        FROM tickets 
        LEFT JOIN users ON tickets.requester_id = users.id 
        WHERE tickets.requester_id = ? 
        ORDER BY tickets.created_at DESC LIMIT ? OFFSET ?`;
      values = [userId, limit, offset];
    }

    const [tickets] = await db.query(sql, values);

    res.status(200).json({
      message: "ดึงข้อมูลสำเร็จ",
      meta: {
        currentPage: page,
        itemsPerPage: limit,
      },
      total_tickets: tickets.length,
      tickets: tickets,
    });
  } catch (error) {
    console.error("ระบบดึงข้อมูลแจ้งซ่อมขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const sql = "SELECT * FROM tickets WHERE id = ?";
    const [tickets] = await db.query(sql, [ticketId]);

    if (tickets.length === 0) {
      return res.status(404).json({ message: "ไม่พบใบแจ้งซ่อมที่ระบุ" });
    }
    
    const logsSql = `SELECT 
        ticket_logs.*, 
        users.employee_id 
      FROM ticket_logs 
      LEFT JOIN users ON ticket_logs.user_id = users.id 
      WHERE ticket_logs.ticket_id = ? 
      ORDER BY ticket_logs.id DESC`;
    const [logs] = await db.query(logsSql, [ticketId]);

    res.status(200).json({
      message: "ดึงข้อมูลสำเร็จ",
      ticket: tickets[0],
      logs: logs
    });
  } catch (error) {
    console.error("ระบบดึงข้อมูลรายบุคคลขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "กรุณาส่งสถานะที่ต้องการอัปเดต" });
    }

    const sql = "UPDATE tickets SET status = ? WHERE id = ?";

    const [result] = await db.query(sql, [status, ticketId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบใบแจ้งซ่อมที่ระบุ" });
    }

    res.status(200).json({
      message: "อัปเดตสเตตัสสำเร็จ",
    });
  } catch (error) {
    console.error("ระบบอัปเดตสเตตัสขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const userId = req.user.id;

    const sql =
      "UPDATE tickets SET assignee_id = ?, status = 'in_progress' WHERE id = ?";

    const [result] = await db.query(sql, [userId, ticketId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบใบแจ้งซ่อมที่ระบุ" });
    }

    res.status(200).json({
      message: "รับงานเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("ระบบรับงานขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const userId = req.user.id;

    const {message} = req.body;

    if (!message) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const sql =
      "INSERT INTO ticket_logs (ticket_id, user_id, action, message) VALUES (?, ?,'commented', ?)";

    const [result] = await db.query(sql, [ticketId, userId, message]);

    res.status(201).json({
      message: "เพิ่มคอมเมนต์สำเร็จ",
    });
  } catch (error) {
    console.error("ระบบคอมเมนต์ขัดข้อง:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};
