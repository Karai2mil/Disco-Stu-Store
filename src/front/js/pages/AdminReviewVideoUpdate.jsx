import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/EditArticleVideos.module.css'


const AdminReviewVideoUpdate = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [videoUpdatesGeneralData, setVideoUpdatesGeneralData] = useState()
    const [updatedVideosData, setUpdatedVideosData] = useState({
        'agregar': [],
        'eliminar': []
    })
    const [selectedVideoId, setSelectedVideoId] = useState()
    const [existingVideosData, setExistingVideosData] = useState([])
    const [articleData, setArticleData] = useState()

    useEffect(() => {
        //Set the added and deleted videos
        const videoUpdatesGeneralData = JSON.parse(localStorage.getItem('videoUpdatesInReview'))
        setVideoUpdatesGeneralData(videoUpdatesGeneralData)
        const newUpdatesVideosData = { ...updatedVideosData }
        videoUpdatesGeneralData.cambios_data.map((cambio) => {
            if (cambio.cambio === 'agregar') {
                newUpdatesVideosData.agregar.push(cambio)
            } else if (cambio.cambio === 'eliminar') {
                newUpdatesVideosData.eliminar.push(cambio)
            }
        })
        setUpdatedVideosData(newUpdatesVideosData)

        //Get article data
        const getArticle = async () => {
            const articleResponse = await actions.getArticleById(videoUpdatesGeneralData.articulo_id)
            setArticleData(articleResponse.article)
        }
        getArticle()

        //Get article videos
        const article_id = videoUpdatesGeneralData.articulo_id
        const getArticleVideos = async () => {
            const response = await actions.getArticleVideos(article_id)
            if (response.data.length > 0) {
                setExistingVideosData(response.data)
            }
        }
        getArticleVideos()
    }, [])

    const approveVideoUpdates = async () => {
        const id = videoUpdatesGeneralData.id
        const approveFetch = await actions.approveVideoUpdates(id)
        if (approveFetch.status === 'COMPLETED') {
            //Alert
            navigate('/approvals')
        }
    }

    const rejectVideoUpdates = async () => {
        const id = videoUpdatesGeneralData.id
        const rejectFetch = await actions.rejectVideoUpdates(id)
        if (rejectFetch.status === 'COMPLETED') {
            //Alert
            navigate('/approvals')
        }
    }

    const handlerNavigateToChannel = (channelId) => {
        window.open(`https://www.youtube.com/channel/${channelId}`, "_blank")
    }


    return (
        <div>
            <div className="container-fluid px-0 mx-0">
                <div className="card border-0 rounded-0">
                    <div
                        className="p-4 text-black"
                        style={{ backgroundColor: "black" }}
                    >
                        <h3 style={{ color: 'white' }} className="text-center">Revisión de videos</h3>
                        <div className="d-flex justify-content-end text-center py-1">
                        </div>
                    </div>
                    <div className="card-body p-4 text-black"></div>
                </div>
            </div>
            {articleData &&
                <div className="container d-flex justify-content-between">
                    <div style={{ width: '45%' }}>
                        <h4 style={{ marginBottom: '20px' }}><strong>{articleData.titulo}</strong></h4>
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
                                        articleData.tracks.map((track) => (
                                            <tr key={track.id}>
                                                <td className="text-left">{track.posicion}</td>
                                                <td>{track.nombre}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <table className={`table`}>
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '100%' }}>Videos actuales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {existingVideosData.length > 0 ? (
                                    existingVideosData.map((video) => {
                                        return (
                                            <tr>
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
                    </div>
                    <div style={{ width: '45%' }}>
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
                        <div className='w-100 mt-3 mb-2' style={{ border: '1px solid rgb(175, 175, 175)' }}>
                            <table className='table mb-0'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th style={{ color: 'red' }}>
                                            <i class="fa-solid fa-arrow-down mx-2"></i>Videos eliminados
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updatedVideosData.eliminar.length > 0 ? (
                                        updatedVideosData.eliminar.map((video) => {
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
                                                    </div>
                                                </td>
                                            </tr>)
                                        })
                                    ) : (
                                        <tr>
                                            <td>
                                                <p>No hay videos eliminados</p>
                                            </td>
                                        </tr>
                                    )
                                    }
                                </tbody>
                                <thead className='table-dark'>
                                    <tr>
                                        <th style={{ color: 'green' }}>
                                            <i class="fa-solid fa-arrow-up mx-2"></i>Videos agregados
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updatedVideosData.agregar.length > 0 ? (
                                        updatedVideosData.agregar.map((video) => {
                                            return (
                                            <tr>
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
                                                    </div>
                                                </td>
                                            </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td>
                                                <p>No hay videos agregados</p>
                                            </td>
                                        </tr>
                                    )
                                    }
                                </tbody>
                                <tfoot style={{ background: 'black' }}>
                                    <div className='d-flex justify-content-end p-1'>
                                        <button onClick={() => approveVideoUpdates()} type='btn' className={`btn btn-success ${styles.button}`} style={{ background: 'green', color: 'white' }}><strong>Aceptar</strong></button>
                                        <button onClick={() => rejectVideoUpdates()} type='btn' className={`btn btn-dark ${styles.button}`} style={{ background: 'red', marginLeft: '10px', color: 'white' }}><strong>Rechazar</strong></button>
                                    </div>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default AdminReviewVideoUpdate