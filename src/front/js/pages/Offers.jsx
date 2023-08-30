import React, { useEffect, useContext } from 'react'
import { Context } from '../store/appContext';
import styles from "../../styles/Offers.module.css";
import { useNavigate } from "react-router-dom";



const Offers = () => {

    const { store, actions } = useContext(Context)
    const article = JSON.parse(localStorage.getItem('currentArticle'));
    const navigate = useNavigate()
    const user_id = localStorage.getItem('userID');

    useEffect(() => {
        actions.getOffers(article.id)
    }, [])

    const addItemToCart = async (offer) => {
        const cart_element = {
            'user_id': user_id,
            'vendedor_id': offer.vendedor_id,
            'oferta_id': offer.id
        }
        const fetchData = await actions.newCartElement(cart_element)
        if (fetchData == 'Already exist') {
            alert('El artículo ya existe en el carrito');
            navigate('/cart')
        } else if (fetchData == 'COMPLETED') {
            navigate('/cart')
        }
    }

    return (
        <div>
            <div id='upper_content' className={styles.upperContent}>
                <div id='left_content'>
                    <img style={{ width: '160px', marginRight: '13px' }} src={article.url_imagen} alt="" />
                </div>
                <div>
                    <p style={{ fontSize: '1.35rem' }}> <strong>{article.titulo}</strong></p>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Sello:</p>
                        <p>{article.sello}</p>
                    </div>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Formato:</p>
                        <p>{article.formato}</p>
                    </div>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Pais:</p>
                        <p>{article.pais}</p>
                    </div>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Publicado:</p>
                        <p>{article.publicado}</p>
                    </div>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Genero:</p>
                        <p>{article.genero}</p>
                    </div>
                    <div className={styles.properties}>
                        <p style={{ width: '100px' }}>Estilos:</p>
                        <p>{article.estilos}</p>
                    </div>
                </div>
                <div id='upper_content_buttons' className={styles.btnDiv}>
                    <div>
                        <button onClick={() => { navigate(`/article/${article.id}`) }} type="button" className={`btn btn-dark ${styles.upperBtn}`}>Ver la pagina de la edición</button>
                        <button onClick={() => navigate(`/sell/${article.id}`)} type="button" className={`btn ${styles.upperBtn}`} style={{ backgroundColor: '#336494' }}>Vender este articulo</button>
                    </div>
                </div>
            </div>

            <div id='offers'>
                <table className={styles.table} style={{ marginBottom: '320px' }}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th style={{ width: '40%', paddingLeft: '10px' }}>Articulo</th>
                            <th style={{ width: '30%', paddingLeft: '10px' }}>Vendedor</th>
                            <th style={{ width: '15%', paddingLeft: '10px' }}>Precio</th>
                            <th style={{ width: '15%', paddingLeft: '10px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.currentOffers.length > 0 ? (
                            store.currentOffers.map((offer, index) => {
                                return (
                                    <tr key={index} style={{ marginBottom: '40px' }}>
                                        <td style={{ width: '40%', paddingLeft: '10px' }}>
                                            <p style={{ marginBottom: '5px' }}><strong>{article.titulo}</strong></p>
                                            <div className={styles.properties}>
                                                <p className={styles.articleConditions}>Estado del soporte:</p>
                                                <p>{offer.condicion_soporte}</p>
                                            </div>
                                            <div className={styles.properties}>
                                                <p className={styles.articleConditions}>Condición de la funda:</p>
                                                <p>{offer.condicion_funda}</p>
                                            </div>
                                            <div className={styles.properties}>
                                                <p>{offer.comentario}</p>
                                            </div>
                                        </td>
                                        <td style={{ width: '25%', paddingLeft: '10px' }}>
                                            <p style={{ marginBottom: '5px' }}><strong>{offer.usuario}</strong></p>
                                            <p>{offer.valoracion}%, {offer.cantidad_de_valoraciones} valoraciones</p>
                                            <div className={styles.properties}>
                                                <p className={styles.articleConditions}>Enviado desde:</p>
                                                <p>{offer.pais_comprador}</p>
                                            </div>
                                        </td>
                                        <td style={{ width: '18%', paddingLeft: '10px' }}>
                                            <p style={{ color: '#CD2906' }}><strong>{offer.precio}</strong></p>
                                            <div style={{ display: 'flex' }}>
                                                <p>+  </p>
                                                <p style={{ color: '#033BDB' }}>envío</p>
                                            </div>
                                        </td>
                                        {(user_id != offer.vendedor_id) ? (
                                            <td style={{ width: '16%', padding: '0px 20px 0px 10px' }}>
                                                <button onClick={() => addItemToCart(offer)} type="button" className={`btn btn-success ${styles.cartBtn}`}>Añadir al carrito</button>
                                            </td>
                                        ) : (
                                            <td style={{ width: '16%', padding: '0px 20px 0px 10px' }}>
                                                <button type="button" className={`btn btn-secondary ${styles.cartBtn}`}>Añadir al carrito</button>
                                            </td>
                                        )
                                        }
                                    </tr>
                                );
                            })
                        ) : (
                            <div className='p-2'>
                                <p><strong>No existen ofertas para este articulo</strong></p>
                            </div>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default Offers