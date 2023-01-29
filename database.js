import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    multipleStatements: true
  })
  .promise();

export async function getArticles() {
  const [rows] = await pool.query('SELECT * FROM Articles');
  return rows;
}
export async function seachrArticlesByname(search){
  const content = '%'+search.search+'%'
  const [row] = await pool.query(`
  SELECT * FROM Articles WHERE Articles.name LIKE ?
  `,[content]);
  return row
}
export async function getArticleDetails(id) {
  const [row] = await pool.query(
    `
    SELECT 
    Articles.id_article, Articles.cod_article, Articles.id_provider, Articles.name, Articles.dimensions, Articles.sale_price, Articles.short_description, Articles.long_description, Articles.pic_1, Articles.pic_2, Articles.pic_3, Articles.pic_4, Articles.stock, Articles.shipping_days,Providers.company_name, Providers.email as provider_email, Providers.description as provider_desc  
    FROM Articles, Providers 
    WHERE Articles.id_provider = Providers.id_provider AND Articles.id_article = ?
  `,
    [id]
  );
  return row;
}
 export async function getCustomer(email, password){

  const [row] = await pool.query(`SELECT * FROM Customers WHERE Customers.email = ? AND Customers.password = ?`,[email, password]);
  return row

 }
export async function insertCustomer(
  id_customer,
  name,
  last_name,
  gender,
  email,
  password,
  telephone,
  street_and_nr,
  PLZ,
  ort,
  id_country
) {
  const [result] = await pool.query(
    `
    INSERT INTO Customers( 
      id_customer,
      name,
      last_name,
      gender,
      email,
      password,
      telephone,
      street_and_nr,
      PLZ,
      ort,
      id_country ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      id_customer,
      name,
      last_name,
      gender,
      email,
      password,
      telephone,
      street_and_nr,
      PLZ,
      ort,
      id_country,
    ]
  );
}
export async function insertArticle(
  cod_article,
  name,
  shipping_days,
  price,
  short_description,
  long_description,
  creation_date,
  stock,
  active,
  pic1,
  pic2,
  pic3,
  pic4
) {
  const [result] = await pool.query(
    `
  INSERT INTO Articles(cod_article, name, shipping_days, price, short_description, long_description, creation_date, stock, active, pic_1, pic_2, pic_3, pic_4)VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      cod_article,
      name,
      shipping_days,
      price,
      short_description,
      long_description,
      creation_date,
      stock,
      active,
      pic1,
      pic2,
      pic3,
      pic4,
    ]
  );
}

export async function makeTheOrder(orderDetail) {

  const [id] = await pool.query(
    `SELECT count(id_order) + 1 as id_order from Orders;`
  );
  // INSERT in table Orders
  const id_order = id[0].id_order;
  const id_customer = orderDetail.id_customer;
  const incom_date = Date.now();
  const state = 'pending';
  const delivered_date = 'pending';
  const pay_method = orderDetail.payMethod;
  const comment = orderDetail.comment;

  // State y delivered_date tienen un valor "pending" porque tiene que ser procesada por Phi-Admin, este sería el procedimiento para hacer efectivo el envío físico de el/los artículos. Una vez que las Ordenes son procesadas por un humano(empleado) los cámbios son actualizados a State = "delivered" y delivered_date = "la fecha en que se procesa la orden"
  const [Orders] = await pool.query(`
    INSERT INTO Orders(id_order, id_customer, incom_date, state, delivered_date,pay_method,comment)
    VALUES(?,?,?,?,?,?,?)`, [id_order, id_customer, incom_date, state, delivered_date, pay_method, comment]);

  // Preparar el INSERT en la tabla Order_Detail con los siguintes pasos
  // 1. Seleccionar los precios individuales de los artículos en la tabla artículos con los id's recibidos.
  // 2. hacer el INSERT en la tabla Order_Details

  // Este ciclo se repite cada vez que se llenan los detalles de la compra 
  for (let i = 0; i < orderDetail.articles.length; ++i) {

    const id_article = orderDetail.articles[i].id_article;
    const amount = orderDetail.articles[i].amount;

    // Aquí se seleccionan los detalles del articulo con su respectivo Id, por ahora id y código pero se podria destructurar para cualquier atributo de la tabla 
    const [row] = await pool.query(
      ` SELECT Articles.sale_price as unit_price, Articles.cod_article from Articles Where Articles.id_article = ?`, [id_article]
    );

    const unit_price = row[0].unit_price;
    const cod_article = row[0].cod_article;
    const total_price = unit_price * amount;
    const taxes = total_price * 0.19; // analizar si el impuesto se mete en el valor total o se separa. en este ejemplo el impuesto se separa en la base de datos.

    const [Order_Details] = await pool.query(`
    INSERT INTO Order_Detail(id_order,id_article,cod_article, amount, unit_price, taxes, total_price )
    VALUES(?,?,?,?,?,?,?)
   `, [id_order,id_article, cod_article, amount,unit_price, taxes, total_price]);
  }
  
}
export async function insertEmailToAds(email) {
const emailToAds = email.email
  const [result] = await pool.query(`
  INSERT INTO Emails_Ads(email) VALUE (?) 
  `,[emailToAds]);
}
export async function additionalInfo(data) {
  const chrome = data.chrome
  const explorer = data.IExplorerAgent
  const firefox = data.firefoxAgent
  const safari = data.safariAgent
  const country = data.country
  const [result] = await pool.query(`
  INSERT INTO additional_Info(chrome, explorer, firefox, safari, country) VALUES (?,?,?,?,?) 
  `,[chrome,explorer,firefox,safari,country]);
}
