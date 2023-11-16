import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from '../../styles/ArticleDetails.module.css'

const ArticleDetails = () => {
    const navigate = useNavigate();
    const { actions } = useContext(Context);

    const article = JSON.parse(localStorage.getItem('currentArticle'));
    const [artist, title] = article.titulo.split(' - ')
    const user_id = localStorage.getItem('userID');

    const [articleVideos, setArticleVideos] = useState([])
    const [selectedVideoId, setSelectedVideoId] = useState()
    const [comment, setComment] = useState()
    const [articleComments, setArticleComments] = useState()

    const handleAddFavorites = async (user_id, article_id) => {
        try {
            const response = await actions.addFavorites(user_id, article_id);

            Swal.fire({
                title: 'Agregado a favoritos',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error('Error adding favorite:', error);

            Swal.fire({
                title: 'Uppss...',
                text: error.message,
                icon: 'warning',
                confirmButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn btn-success border-0 rounded-0'
                }
            });
        }
    };

    const handlerSellVinyl = () => {
        const sellerValidation = async () => {
            const user_id = localStorage.getItem('userID')
            if (!user_id) {
                navigate('/login')
            }
            const backendUrl = process.env.BACKEND_URL + `/api/users/validate_seller/${user_id}`;
            return await fetch(backendUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result === 'VALIDATED') {
                        navigate(`/sell/${article.id}`)
                    } else {
                        navigate('/sellers')
                    }
                });
        };
        sellerValidation()
    }

    const handlerUploadVideos = () => {
        navigate(`/videos/update/${article.id}`)
    }

    if (!article) {
        return <div>Loading...</div>;
    }

    useEffect(() => {
        const article_id = article.id
        const getArticleVideos = async () => {
            const response = await actions.getArticleVideos(article_id)
            if (response.data.length > 0) {
                const video_id_0 = response.data[0].video_id
                setSelectedVideoId(video_id_0)
                setArticleVideos(response.data)
            }
        }
        getArticleVideos()
    }, [])

    useEffect(() => {
        const articulo_id = article.id

        const getArticleComments = async () => {
            const responseCommentsFetch = await actions.getArticleComments(articulo_id)
            if (responseCommentsFetch.status === 'COMPLETED') {
                setArticleComments(responseCommentsFetch.data)
            }
        }

        getArticleComments()
    }, [])

    const hanlderSendComment = async () => {
        const user_id = localStorage.getItem('userID')
        const articulo_id = article.id
        const comment_data = {
            'user_id': user_id,
            'articulo_id': articulo_id,
            'comentario': comment
        }
        console.log(comment_data)
        const sendCommentResponse = await actions.sendArticleComment(comment_data)
        if (sendCommentResponse.status === 'COMPLETED') {
            location.reload()
        }
    }

    const reportComment = async (comment_id) => {
        const user_id = localStorage.getItem('userID')
        const report_data = {
            'user_id': user_id,
            'comment_id': comment_id
        }
        const reportCommentResponse = await actions.reportComment(report_data)
        if (reportCommentResponse.status === 'COMPLETED') {
            location.reload()
        }
    }

    const deleteComment = async(comment_id) => {
        const deleteCommentResponse = await actions.deleteArticleComment(comment_id)
        if (deleteCommentResponse.status === 'COMPLETED') {
            location.reload()
        }
    }

    const hanlderNavigateLogin = () => {
        navigate('/login')
    }

    return (
        <div className="container mt-4 mb-4 p-0 d-flex justify-content-between">
            <div className="d-flex flex-column" style={{ width: '65%' }}>
                <div className="d-flex" style={{ minWidth: '100%' }}>
                    <div style={{ width: '25%' }}>
                        <img src={article.url_imagen} alt="{article.title}"
                            className="img-fluid" />
                    </div>
                    <div className="h-100 d-flex flex-column justify-content-between" style={{ marginLeft: '2%', height: '100%' }}>
                        <div className="mb-2">
                            <div>
                                <h3>{artist} - {title}</h3>
                            </div>
                        </div>
                        {/* <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>ID:</strong>
                            </div>
                            <div>
                                {article.id}
                            </div>
                        </div> */}
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>Sello:</strong>
                            </div>
                            <div>
                                {article.sello}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>Formato:</strong>
                            </div>
                            <div>
                                {article.formato}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>País:</strong>
                            </div>
                            <div>
                                {article.pais}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>Publicado:</strong>
                            </div>
                            <div>
                                {article.publicado}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>Género:</strong>
                            </div>
                            <div>
                                {article.genero}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div style={{ width: '120px' }}>
                                <strong>Estilos:</strong>
                            </div>
                            <div>
                                {article.estilos}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p style={{ marginTop: '30px' }}><strong>Lista de titulos</strong></p>
                    <table className="table">
                        <thead className="table-dark">
                            <tr>
                                <td style={{ width: '8%' }}>#</td>
                                <td style={{ width: '95%' }}>TITULO</td>
                            </tr>
                        </thead>
                        <tbody>
                            {article.tracks.map((track) => (
                                <tr key={track.id} className={styles.songList}>
                                    <td className="text-left">{track.posicion}</td>
                                    <td>{track.nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex flex-column mb-4">
                    <p style={{ marginTop: '30px' }}><strong>Comentarios</strong></p>
                    <textarea onChange={(e) => setComment(e.target.value)} name="comentarios" cols="30" rows="4" value={comment} placeholder="Escribe tu comentario aquí"></textarea>
                    <div className='d-flex justify-content-end mt-2'>
                        {
                            localStorage.getItem('token') ? (
                                <button onClick={() => hanlderSendComment()} type="btn" className="btn btn-dark">Enviar</button>
                            ) : (
                                <button onClick={() => hanlderNavigateLogin()} type="btn" className="btn btn-dark">Enviar</button>
                            )
                        }
                    </div>
                </div>
                <div>
                    {articleComments &&
                        articleComments.length > 0 &&
                        articleComments.map((comment, index) => (
                            <div key={index} className="w-100 p-2" style={{ borderBottom: '2px solid rgb(229, 229, 229)', marginBottom: '10px' }}>
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex">
                                        <p>{comment.user_usuario}</p>
                                        <p style={{ fontSize: '14px', marginTop: 'auto' }}>, {comment.fecha}</p>
                                    </div>
                                    <div className="dropdown">
                                        <i style={{ cursor: 'pointer' }} className="fa-solid fa-caret-down" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <ul className="dropdown-menu dropdown-menu-end py-2 w-25" >
                                            {user_id == comment.user_id ? (
                                                <li style={{ fontSize: '13px' }}><p className={`dropdown-item py-0 ${styles.reportLetter}`} onClick={() => deleteComment(comment.id)}><i style={{ width: '25px' }} className="fa-solid fa-trash-can"></i>Eliminar</p></li>
                                            ) : (
                                                <li style={{ fontSize: '13px' }}><p className={`dropdown-item py-0 ${styles.reportLetter}`} onClick={() => reportComment(comment.id)}><i style={{ width: '25px' }} className="fa-solid fa-comment-slash"></i>Denunciar</p></li>
                                            )
                                            }
                                        </ul>
                                    </div>

                                </div>
                                <p>{comment.comentario}</p>
                            </div>
                        ))

                    }
                </div>
            </div>
            <div className="d-flex flex-column" style={{ width: '28%' }}>
                <div>
                    <div className={`btn-group-vertical btn-block ${styles.buttons}`} role="group">
                        <button className="btn btn-dark mb-2" onClick={() => handleAddFavorites({ user_id, articulo_id: article.id })}>Agregar a deseados</button>
                        <button onClick={() => navigate(`/offers/${article.id}`)} className="btn btn-dark mb-2">Comprar Vinilo</button>
                        <button onClick={() => handlerSellVinyl()} className="btn btn-dark mb-2">Vender Vinilo</button>
                        <button onClick={() => navigate(`/articles/edit/${article.id}`)} style={{ cursor: 'pointer' }} className="btn btn-dark mb-2">
                            Editar artículo
                        </button>
                        <button onClick={() => window.history.back()} className="btn btn-dark mb-2">Regresar</button>
                    </div>
                </div>
                <div className={`w-100`}>
                    <div className="d-flex">
                        <p style={{ fontWeight: 'bold', margin: '0px 5px' }}>Videos ({articleVideos.length})</p>
                        <p onClick={() => handlerUploadVideos()} className={styles.blueFont} style={{ marginTop: 'auto' }}>Editar videos</p>
                    </div>
                    {articleVideos && //agregamos esto solo para que funcione cuando se pueden cargar los videos (en caso de tener problemas de restricciones de youtube)
                        articleVideos.length > 0 ? (
                        <div>
                            <div>
                                <iframe style={{ width: '100%', height: '230px' }} src={`https://www.youtube.com/embed/${selectedVideoId}`} frameBorder="0" allowfullscreen="1"></iframe>
                            </div>
                            <div className={`d-flex flex-column ${styles.videosScroll}`}>
                                {articleVideos.map((video) => (
                                    <div className={`d-flex ${video.id === selectedVideoId ? (styles.selectedVideo) : (styles.videoList)}`} onClick={() => setSelectedVideoId(video.video_id)} key={video.video_id}>
                                        <img className={styles.videoListImg} src={video.url_imagen} alt="" />
                                        <p className={styles.blueFont}>{video.titulo}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '230px' }}>
                            <img style={{ width: '100%', height: '100%' }} src='https://s1.eestatic.com/2018/09/13/elandroidelibre/el_androide_libre_337730763_179714641_1706x960.jpg' alt="" />
                        </div>
                    )
                    }
                </div>
            </div>
        </div >
    )
}

export default ArticleDetails;
