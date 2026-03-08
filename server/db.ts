import postgres, { Sql } from "postgres";


const sql: Sql = postgres(process.env.DATABASE_URL!, {
    prepare: false
})

export default sql