import sql from "../../db";

export const getUsers = async () => {
  try {
    const users = await sql`
    SELECT * 
    FROM users
    ORDER BY id ASC`;
    return users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    });
  } catch (err) {
    return err;
  }
};

export const createUser = async ({ body }: any) => {
  try {
    await sql`
    INSERT INTO users(name, email) 
    VALUES (${body.name}, ${body.email})`;
    return `add user successfully`;
  } catch (err) {
    return err;
  }
};

export const updataUserById = async ({ params, body }: any) => {
  try {
    await sql` 
    UPDATE users 
    SET name = ${body.name}, email = ${body.email} 
    WHERE id = ${params.id}`;
    return "Update success!!!";
  } catch (err) {
    return err;
  }
};
export const deleteUserById = async ({ params }: any) => {
  try {
    await sql` 
    DELETE FROM users
    WHERE id = ${params.id}`;
    return "Delete success!!!";
  } catch (err) {
    return err;
  }
};
