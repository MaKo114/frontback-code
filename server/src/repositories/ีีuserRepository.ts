// เอาไว้รวมคำสั่ง sql ที่ไฟล์นี้ หรือ แยกเป็นไฟล์ใน folder repositories

import sql from "../../db";

// ตัวอย่าง

// export const getAllUsers = (email: string) => {
//   return sql` 
//     SELECT id, email, password, role FROM "User"
//     WHERE email = ${email}
//     `;
// };

/*
จากโค้ดที่เขียนรวมกับ sql command แบบนี้ 
const user = await sql` 
    SELECT id, email, password, role FROM "User"
    WHERE email = ${email}


จะได้แบบนี้

const user = await getAllUsers(email) // รับ email มาเพื่อเอามาเช็คอีกที
*/
