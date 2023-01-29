import express from 'express';
import cors from 'cors';
import {
  getArticles,
  getCustomer,
  getArticleDetails,
  insertArticle,
  insertCustomer,
  makeTheOrder,
  insertEmailToAds,
  seachrArticlesByname, 
  additionalInfo
} from './database.js';

const app = express();

app.use(express.json());

app.use(cors());

app.get('/articles', async (req, res) => {
  const articles = await getArticles();
  res.send(articles);
});

//Buscar Artículos por Nombre
app.get('/:search', async(req, res)=> {
  const search = req.query
  const result = await seachrArticlesByname(search);
  res.send(result);
} );

app.get('/article-details/:id', async (req, res) => {
  const id = req.params.id;
  const article = await getArticleDetails(id);
  res.send(article);
});

//GET Customer per email and password
app.get('/customer/:login', async (req, res) =>{
  const {email, password} = req.query;
  const login = await getCustomer(email, password);
  if (login.length == 0){
     res.status(404).send()
  }else{
    res.status(201).send(login);
  }
})

app.post('/customer', async (req, res) => {
  const {
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
  } = req.body;

  const customer = await insertCustomer(
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
  );
  res.status(201).send(customer);
});

app.post('/order', async (req, res) => {
  console.log('Order:',req.body);
  const orderDetail = await makeTheOrder(req.body);
  res.status(201).send(orderDetail);
});
app.post('/email', async (req, res) => {
  console.log('email:',req.body, );
const email = await insertEmailToAds(req.body);
res.status(201).send(email);
});

app.post('/additional-info', async (req, res) => {
  console.log('landing on..',req.body, );
  const data = await additionalInfo(req.body);
  res.status(201).send(data);
});

app.post('/article', async (req, res) => {
  const {
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
  } = req.body;

  const article = await insertArticle(
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
  );
  res.status(201).send(article);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

 const PORT = process.env.PORT || 8080;
 app.listen(PORT, () => {
console.log(`Server is running on port ${PORT} `);
});

