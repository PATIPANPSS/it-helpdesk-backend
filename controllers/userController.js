const db = require("../config/db");

exports.getAllUsers = async (req, res) => {
  try {
    const sql =
      "SELECT id, employee_id, role, created_at FROM users ORDER BY created_at DESC";
    const [users] = await db.query(sql);

    res.status(200).json({ users: users });
  } catch (error) {
    console.error("ระบบดึงข้อมูลผู้ใช้งานขัดข้อง:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res
        .status(400)
        .json({ message: "กรุณาส่งข้อมูลที่ต้องการอัปเดต" });
    }

    const sql = "UPDATE users SET role = ? WHERE id = ?";
    const [result] = await db.query(sql, [role, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" });
    }
    res.status(200).json({ message: "อัปเดตสิทธิ์การใช้งานสำเร็จ!" });
  } catch (error) {
    console.error("ระบบอัปเดตยศขัดข้อง:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};
