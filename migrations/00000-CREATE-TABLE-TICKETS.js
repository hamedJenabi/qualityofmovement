exports.up = async (sql) => {
  await sql`
  CREATE TABLE tickets(
  id SERIAL PRIMARY KEY, 
  name VARCHAR NOT NULL,
  capacity int,
  waiting_list int
  )
  `;
};

exports.down = async (sql) => {
  await sql`
	  DROP TABLE tickets
	  `;
};
