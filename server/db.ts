import postgres, { Sql } from "postgres";


const sql: Sql = postgres(process.env.DATABASE_URL!)

export default sql