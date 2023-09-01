import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../store/appContext'
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../../styles/SellArticle.css';
import Swal from 'sweetalert2';

const SellArticle = () => {

    const { actions } = useContext(Context)
    const navigate = useNavigate()

    const article = JSON.parse(localStorage.getItem('currentArticle'));

    const [soporte, setSoporte] = useState({})
    const [funda, setFunda] = useState('')
    const [comentario, setComentario] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [precio, setPrecio] = useState('')
    const [isSeller, setIsSeller] = useState(false)

    const handleSoporte = (event) => {
        setSoporte(event.target.value)
    }
    const handleFunda = (event) => {
        setFunda(event.target.value)
    }
    const handleComentario = (event) => {
        setComentario(event.target.value)
    }
    const handleCantidad = (event) => {
        setCantidad(event.target.value)
    }
    const handlePrecio = (event) => {
        setPrecio(event.target.value)
    }

    const postOffer = async () => {
        const user_id = localStorage.getItem('userID');
        const offer = {
            'vendedor_id': user_id,
            'articulo_id': article.id,
            'condicion_soporte': soporte,
            'condicion_funda': funda,
            'comentario': comentario,
            'cantidad': cantidad,
            'precio': precio,
        }

        try {
            await actions.postOffer(offer);
            Swal.fire({
                icon: 'success',
                title: 'Oferta agregada',
                text: 'La oferta se ha agregado correctamente.',
            });
            navigate(`/offers/${article.id}`);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al agregar la oferta. Por favor, inténtalo nuevamente.',
            });
        }
    }

    useEffect(() => {
        const sellerValidation = async () => {
            const user_id = localStorage.getItem('userID')
            const backendUrl = process.env.BACKEND_URL + `/api/users/validate_seller/${user_id}`;
            return await fetch(backendUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result == 'VALIDATED') {
                        setIsSeller(true)
                    } else if (result == 'NOT VALIDATED') {
                        navigate('/sellers')
                    }
                });
        };
        sellerValidation()
    }), []

    return (
        <div className="container">
            {isSeller &&
                <div>
                    <div id='title'>
                        <h4><strong>Vender articulo</strong></h4>
                        <p>Por favor, verifica que este sea el articulo que deseas vender.</p>
                    </div>
                    <div id="article_info" className="row d-flex">
                        <div id="image" className='col-md-2'>
                            <img className="img-fluid" src={article.url_imagen} alt="" />
                        </div>
                        <div className="col-md-9">
                            <h5><strong>{article.titulo}</strong></h5>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Sello:</p>
                                <p>{article.sello}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Formato:</p>
                                <p>{article.formato}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Pais:</p>
                                <p>{article.pais}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Publicado:</p>
                                <p>{article.publicado}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Genero:</p>
                                <p>{article.genero}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ width: '40px' }}>Estilos:</p>
                                <p>{article.estilos}</p>
                            </div>
                        </div>
                    </div>
                    <div id='advertencia'>
                        <p style={{ fontSize: '1rem', padding: '5px 0px 5px 10px' }}><strong>El listado de articulos es gratis, Disco Stu cobrara una tarifa del 5% una vez finalizada la venta.</strong></p>
                    </div>
                    <div id='properties'>
                        <div>
                            <h5><strong>Estado y comentarios</strong></h5>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="condicionSoporte">Condición del soporte</label>
                            <select onChange={(e) => handleSoporte(e)} value={soporte} className="form-select form-select-sm" id='condicionSoporte' aria-label="Small select example">
                                <option value="">Seleccionar condicion</option>
                                <option value="Nuevo (N)">Nuevo (N)</option>
                                <option value="Casi Nuevo (CN)">Casi Nuevo (CN)</option>
                                <option value="Buen Estado (BE)">Buen Estado (BE)</option>
                                <option value="Gastado (G)">Gastado (G)</option>
                                <option value="Deteriorado (D)">Deteriorado (D)</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="condicionFunda">Condición de la funda</label>
                            <select onChange={(e) => handleFunda(e)} value={funda} className="form-select form-select-sm" id='condicionFunda' aria-label="Small select example">
                                <option value="">Seleccionar condicion</option>
                                <option value="Genérico">Genérico</option>
                                <option value="Sin Funda">Sin Funda</option>
                                <option value="Nuevo (N)">Nuevo (N)</option>
                                <option value="Casi Nuevo (CN)">Casi Nuevo (CN)</option>
                                <option value="Buen Estado (BE)">Buen Estado (BE)</option>
                                <option value="Gastado (G)">Gastado (G)</option>
                                <option value="Deteriorado (D)">Deteriorado (D)</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="comentarios">Comentarios específicos</label>
                            <textarea onChange={(e) => handleComentario(e)} value={comentario} maxLength="300" className="form-control" id='comentarios' placeholder='ejemplo: funda con bordes dañados y soporte con etiqueta de precio en galleta.'></textarea>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="cantidad">Cantidad</label>
                            <select onChange={(e) => handleCantidad(e)} value={cantidad} style={{ width: '80px' }} className="form-select form-select-sm" id='cantidad' aria-label="Small select example">
                                <option value=""></option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div id='precio' style={{ marginTop: '20px' }}>
                            <h5><strong>Precio</strong></h5>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="precio">Precio (USD)</label>
                            <div style={{ paddingLeft: '10px' }}>
                                <span>$</span>
                                <input onChange={(e) => handlePrecio(e)} value={precio} type="text" style={{ width: '100px' }} />
                            </div>
                        </div>
                        <button onClick={() => postOffer()} type='button' className='btn btn-dark'>Poner articulos en venta</button>
                    </div>
                </div>
            }
        </div>
    );
};

export default SellArticle;
