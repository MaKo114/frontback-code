import { getAllUser } from "@/api/user";
import useTestStore from "@/store/tokStore";
import { useEffect, useState } from "react";

interface User {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "BANNED";
}


const AdminUsers = () => {
  const token = useTestStore((s)=> s.token)
  const [users, setUsers] = useState<User[]>([]);

  const fetchUser = async() => {
    try{
      const res = await getAllUser(token)
      setUsers(res.data)

    }catch(err){
      console.log(err);  
    }
  }

  const toggleStatus = (id: number) => {
    setUsers(users.map(u =>
      u.student_id === id
        ? { ...u, status: u.status === "ACTIVE" ? "BANNED" : "ACTIVE" }
        : u
    ));
  };
  

  useEffect(()=>{
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ผู้ใช้</h1>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ชื่อ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">อีเมล</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.first_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.status === "ACTIVE" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(user.student_id)}
                        className={`px-4 py-1.5 text-xs text-white rounded-lg transition-colors ${
                          user.status === "ACTIVE"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;