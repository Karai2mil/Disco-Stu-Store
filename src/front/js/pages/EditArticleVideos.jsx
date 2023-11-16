import React, { useEffect, useState, useContext } from 'react'
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import styles from '../../styles/EditArticleVideos.module.css'



const EditArticleVideos = () => {

    const navigate = useNavigate();
    const { actions } = useContext(Context)

    const article = JSON.parse(localStorage.getItem('currentArticle'))
    const [searchInput, setSearchInput] = useState(article.titulo)
    const [searchVideosData, setSearchVideosData] = useState([])
    const [selectedVideoId, setSelectedVideoId] = useState()
    const [uploadedVideosData, setUploadedVideosData] = useState([])
    const [existingVideosData, setExistingVideosData] = useState([])
    const [videosToDelete, setVideosToDelete] = useState([])
    const [videosToAdd, setVideosToAdd] = useState([])
    

    useEffect(() => {
        const article_id = article.id
        const getArticleVideos = async () => {
            const response = await actions.getArticleVideos(article_id)
            setUploadedVideosData(response.data)
            setExistingVideosData(response.data)
        }
        getArticleVideos()
    }, [])

    useEffect(() => {
        //Seteamos la busqueda inicial al titulo del disco
        setSearchInput
        handlerRequestSearchVideos()
    }, [])

    const handlerRequestSearchVideos = async () => {
        try {
            const key = process.env.YOUTUBE_API_KEY
            const maxResults = 5
            const part = 'snippet'
            const api_keywords = searchInput.replace(/ /g, '%20')

            const request_url = `https://youtube.googleapis.com/youtube/v3/search?part=${part}&maxResults=${maxResults}&q=${api_keywords}&key=${key}&type=video`

            const response = await fetch(request_url, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            const data = await response.json()
            const searchedVideosArray = []
            data.items.map((item) => {

                // Crear un objeto de fecha a partir de la cadena ISO 8601
                const fechaISO8601 = item.snippet.publishedAt
                const fecha = new Date(fechaISO8601);

                // Obtener el día, mes y año
                const dia = fecha.getUTCDate();
                const mes = fecha.getUTCMonth() + 1; // Agregar 1 porque los meses en JavaScript comienzan desde 0
                const año = fecha.getUTCFullYear();

                // Formatear la fecha en el formato "día-mes-año"
                const fechaFormateada = dia + "-" + mes + "-" + año;

                const video_data_dict = {
                    'video_id': item.id.videoId,
                    'titulo': decodeHTMLEntities(item.snippet.title),
                    'url_imagen': item.snippet.thumbnails.default.url,
                    'fecha_creacion_video': fechaFormateada,
                    'nombre_canal': decodeHTMLEntities(item.snippet.channelTitle),
                    'canal_id': item.snippet.channelId,
                }
                searchedVideosArray.push(video_data_dict)
            })
            setSearchVideosData(searchedVideosArray)
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const decodeHTMLEntities = (text) => {
        const el = document.createElement("div");
        el.innerHTML = text;
        return el.innerText;
    }

    const handlerVideosToDelete = (video) => {
        const isVideoInExistingVideos = existingVideosData.some((existingVideo) => existingVideo.video_id === video.video_id) //Check that video is added from search videos
        if (isVideoInExistingVideos) {
            // If is not, we add to videos to delete
            video.cambio = 'eliminar'
            setVideosToDelete((oldVideosToDelete) => [...oldVideosToDelete, video])
        } else {
            //If it is, we delete the video from videosToAdd and re-add the video to the search videos
            const videosToAddFiltered = videosToAdd.filter((video) => video.video_id != video.video_id)
            console.log(videosToAddFiltered)
            setVideosToAdd(videosToAddFiltered)
            setSearchVideosData((oldSearchVideosData) => [...oldSearchVideosData, video])
        }
        const uploadedVideosFiltered = uploadedVideosData.filter((videos) => videos.video_id != video.video_id)
        setUploadedVideosData(uploadedVideosFiltered)
    }

    const handlerVideosToAdd = (video) => {
        video.cambio = 'agregar'
        setVideosToAdd((oldVideosToAdd) => [...oldVideosToAdd, video])
        const searchedVideosFiltered = searchVideosData.filter((videos) => videos.video_id != video.video_id)
        setSearchVideosData(searchedVideosFiltered)
        setUploadedVideosData((oldExistingVideos) => [...oldExistingVideos, video])
    }

    const handlerSaveChanges = async () => {
        const article = JSON.parse(localStorage.getItem('currentArticle'));
        const article_id = article.id;
        const user_id = localStorage.getItem('userID')
        try {
            const updateRequestResponse = await actions.addVideoUpdateRequest({
                'user_id': user_id,
                'articulo_id': article_id,
                'videos_data_agregar': videosToAdd,
                'videos_data_eliminar': videosToDelete
            });
            if (updateRequestResponse.status === 'COMPLETED') {
                navigate(`/article/${article_id}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlerCancelChanges = () => {
        navigate(`/article/${JSON.parse(localStorage.getItem('currentArticle')).id}`)
    }

    const handlerNavigateToChannel = (canal_id) => {
        window.open(`https://www.youtube.com/channel/${canal_id}`, "_blank")
    }

    return (
        <div className='d-flex justify-content-between' style={{ padding: '3%  6%' }}>
            <div className="d-flex flex-column" style={{ width: '40%' }}>
                <h4 style={{ marginBottom: '20px' }}><strong>{article.titulo}</strong></h4>
                <div>
                    <p><strong>Lista de titulos</strong></p>
                    <table className="table">
                        <thead className="table-dark">
                            <tr>
                                <td style={{ width: '5%' }}><strong>#</strong></td>
                                <td style={{ width: '95%' }}><strong>Título</strong></td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                article.tracks.map((track) => (
                                    <tr key={track.id} className={styles.songList}>
                                        <td className="text-left">{track.posicion}</td>
                                        <td>{track.nombre}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <table className={`table ${styles.borderTables}`}>
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: '100%' }}>Videos actuales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploadedVideosData.length > 0 ? (
                            uploadedVideosData.map((video) => {
                                return (
                                    <tr>
                                        <td>
                                            <div className='d-flex w-100 justify-content-between align-items-center' key={video.video_id}>
                                                <div className='d-flex'>
                                                    <img onClick={() => setSelectedVideoId(video.video_id)} src={video.url_imagen} alt="" style={{ cursor: 'pointer' }} />
                                                    <div className='d-flex flex-column' style={{ padding: '0px 10px' }}>
                                                        <p className={styles.blueFont} onClick={() => setSelectedVideoId(video.video_id)}>{video.titulo}</p>
                                                        <div className='d-flex'>
                                                            <p style={{ fontSize: '13px' }}>publicado el {video.fecha_creacion_video} por <p onClick={() => handlerNavigateToChannel(video.canal_id)} className={styles.blueFont} style={{ fontSize: '13px' }}>{video.nombre_canal}</p></p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handlerVideosToDelete(video)} type='btn' className={`btn btn-dark ${styles.button}`}><i className="fa-solid fa-trash-can" style={{ marginRight: '10%', fontSize: '10px' }}></i>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td>
                                    <p>Articulo sin videos</p>
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
                <div className='d-flex justify-content-end'>
                    {videosToAdd.length > 0 || videosToDelete.length > 0 ? (
                        <button onClick={() => handlerSaveChanges()} type='btn' className={`btn btn-dark ${styles.button}`}>Guardar cambios</button>
                    ) : (
                        <button onClick={() => handlerSaveChanges()} type='btn' className={`btn btn-dark ${styles.button}`} disabled>Guardar cambios</button>)
                    }
                    <button onClick={() => handlerCancelChanges()} type='btn' className={`btn btn-danger ${styles.button}`} style={{ marginLeft: '5px' }}>Cancelar</button>
                </div>
            </div>
            <div className='d-flex flex-column align-items-center' style={{ width: '48%' }}>
                <div className='videoPlayer d-flex align-items-center justify-content-center w-100'>
                    {selectedVideoId ? (
                        <div style={{ width: '100%', height: '300px' }}>
                            <iframe style={{ width: '100%', height: '300px' }} src={`https://www.youtube.com/embed/${selectedVideoId}`} frameBorder="0" allowfullscreen="1"></iframe>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '300px' }}>
                            <img style={{ width: '100%', height: '100%' }} src='https://s1.eestatic.com/2018/09/13/elandroidelibre/el_androide_libre_337730763_179714641_1706x960.jpg' alt="" />
                        </div>
                    )
                    }
                </div>
                <table className='table w-100 mt-3'>
                    <thead className="table-dark">
                        <tr>
                            <th className='d-flex justify-content-between align-items-center py-0'>
                                <div style={{ width: '45%' }}>
                                    <p>Busca tu video de YouTube</p>
                                </div>
                                <div style={{ width: '80%' }} className='d-flex justify-content-between py-2 align-items-center'>
                                    <input style={{ width: '84%', height: '35px' }} onChange={(e) => setSearchInput(e.target.value)} value={searchInput} id='searchbar' type="text" placeholder={article.titulo} />
                                    <button style={{ width: '15%' }} onClick={() => handlerRequestSearchVideos()} type='btn' className={`btn btn-light ${styles.button}`}>Submit</button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchVideosData.length > 0 ? (
                            searchVideosData.map((video) => {
                                return (<tr>
                                    <td>
                                        <div className='d-flex w-100 justify-content-between align-items-center' key={video.video_id}>
                                            <div className='d-flex'>
                                                <img onClick={() => setSelectedVideoId(video.video_id)} src={video.url_imagen} alt="" style={{ cursor: 'pointer' }} />
                                                <div className='d-flex flex-column' style={{ padding: '0px 10px' }}>
                                                    <p className={styles.blueFont} onClick={() => setSelectedVideoId(video.video_id)}>{video.titulo}</p>
                                                    <div className='d-flex'>
                                                        <p style={{ fontSize: '13px' }}>publicado el {video.fecha_creacion_video} por</p>
                                                        <p onClick={() => handlerNavigateToChannel(video.canal_id)} className={styles.blueFont} style={{ fontSize: '13px', marginLeft: '5px' }}>{video.nombre_canal}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handlerVideosToAdd(video)} type='btn' className={`btn btn-dark ${styles.button}`}>Añadir</button>
                                        </div>
                                    </td>
                                </tr>)
                            })
                        ) : (
                            <tr>
                                <td>
                                    <p>No se encontraron videos</p>
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
                <div className='videoList d-flex flex-column w-100 align-items-center justify-content-center'>

                </div>
            </div>
        </div>
    )
}

export default EditArticleVideos

