import express from "express"
import cors from 'cors'
//Import das rotas do app
import rotasPrestadores from './routes/prestador.js'

const app = express()
const port = process.env.PORT || 3900

app.use(cors())
app.use(express.urlencoded({extended: true})) //permite acentos na URL
app.use(express.json()) // Irá fazer parse de arquivos JSON
    //Configura o favicon
app.use('/favicon.ico', express.static('public/favicon.ico'))
    //Rotas de conteúdo publico

app.use('/', express.static('public'))
app.use('/api/prestadores', rotasPrestadores)

app.get('/api', (req, res)=> {
    res.status(200).json({
        message: 'API Fatec Mobile 100% funcional👋',
        version: '1.0.0'
    })
})

//Rota para tratar erros - deve ser sempre a última"

app.use(function(req, res){
    res.status(404).json({
        erros: [
            {
                value: `${req.originalUrl}`,
                msg: `A rota ${req.originalUrl} não existe nesta API!`,
                param: 'Invalid route'
            }]
    })
})

app.listen(port, function(){
    console.log(`Servidor rodando na porta ${port}! 🚀`)

})