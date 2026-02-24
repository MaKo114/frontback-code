import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "banned";
}

const mockUsers: User[] = [
  { id: 1, name: "ไอดีหมายเลข 1", email: "toto@hotmail.com", status: "active" },
  { id: 2, name: "ไอดีหมายเลข 2", email: "toto@hotmail.com", status: "active" },
  { id: 3, name: "ไอดีหมายเลข 3", email: "toto@hotmail.com", status: "active" },
  { id: 4, name: "ไอดีหมายเลข 4", email: "toto@hotmail.com", status: "active" },
  { id: 5, name: "ไอดีหมายเลข 5", email: "toto@hotmail.com", status: "banned" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const toggleStatus = (id: number) => {
    setUsers(users.map(u =>
      u.id === id
        ? { ...u, status: u.status === "active" ? "banned" : "active" }
        : u
    ));
  };

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
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`px-4 py-1.5 text-xs text-white rounded-lg transition-colors ${
                          user.status === "active"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {user.status === "active" ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
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