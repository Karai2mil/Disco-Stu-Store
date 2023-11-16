import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";
import styles from '../../styles/EditArticleVideos.module.css'

import "../../styles/home.css";


export const AdminApprovals = () => {

    const [articlesUpdates, setArticlesUpdates] = useState([]);
    const [videoUpdates, setVideoUpdates] = useState([])
    const [articlesIsActive, setArticlesIsActive] = useState(true)
    const [videosIsActive, setVideosIsActive] = useState(false)
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
        sessionStorage.getItem("pendingApprovals") || 0
    );
    const { actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPendingArticles = async () => {
            const pendingArticleApprovals = await actions.getArticleForApproval();
            setArticlesUpdates(pendingArticleApprovals);
            const pendingVideoApprovals = await actions.getVideoUpdates();
            setVideoUpdates(pendingVideoApprovals.data);

            if (pendingArticleApprovals && pendingVideoApprovals) {
                const totalApprovals = pendingArticleApprovals.length + pendingVideoApprovals.data.length
                sessionStorage.setItem("pendingApprovals", totalApprovals);
                setPendingApprovalsCount(totalApprovals);
            }
        };

        const handlePendingApprovalsUpdate = (event) => {
            if (event.data && event.data.type === "pendingApprovalsUpdated") {
                const newValue = event.data.value;
                setPendingApprovalsCount(newValue);
            }
        };

        fetchPendingArticles();

        window.addEventListener("message", handlePendingApprovalsUpdate);

        return () => {
            window.removeEventListener("message", handlePendingApprovalsUpdate);
        };
    }, []);

    useEffect(() => {
        const fetchDataArticles = async () => {
            try {
                const data = await actions.getArticleForApproval();
                setArticlesUpdates(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchDataArticles();

    }, []);

    useEffect(() => {
        const fetchDataVideos = async () => {
            try {
                const response = await actions.getVideoUpdates();
                console.log(response)
                setVideoUpdates(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchDataVideos();
    }, []);

    const handleArticleReview = (item) => {
        actions.setArticleToApprove(item);
        navigate(`/article-review/${item.id}`);
    }

    const handleVideoUpdateReview = (update) => {
        localStorage.setItem('videoUpdatesInReview', JSON.stringify(update));
        navigate(`/videos/update/review/${update.id}`);
        console.log(update)
    }

    const handlerActiveVideos = () => {
        setArticlesIsActive(false)
        setVideosIsActive(true)
    }

    const handlerActiveArticles = () => {
        setArticlesIsActive(true)
        setVideosIsActive(false)
    }

    return (
        <div>
            <div className="container-fluid p-0 m-0">
                <div className="card border-0 rounded-0">
                    <div
                        className="text-white d-flex flex-row justify-content-center flex-column"
                        style={{ backgroundColor: "#000", height: "170px" }}
                    >
                        <div className="text-white">
                            <h3 className="text-center">Panel de Administrador</h3>
                        </div>
                        <div id="icons" style={{ marginTop: '30px' }}>
                            <div  style={{width: '70%'}} className="d-flex align-items-center justify-content-between m-auto">
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/home-edition" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-pencil p-2"></i>
                                        <p>Editar home</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-panel" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-users p-2"></i>
                                        <p style={{ fontSize: '1.1rem' }}>Administrar usuarios</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0 justify-content-center">
                                    <Link to="/approvals" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-clipboard p-2"></i>
                                        {pendingApprovalsCount > 0 && (
                                            <span className="badge bg-danger top-0 start-100 translate-middle"
                                                style={{
                                                    fontSize: '0.5rem',
                                                    padding: '0.2rem 0.5rem',
                                                    top: '-1rem'
                                                }}
                                            >
                                                {pendingApprovalsCount}
                                            </span>
                                        )}
                                        <p>Aprobaciones</p>
                                    </Link>
                                    <div className="d-flex justify-content-center">
                                        <i className="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
                                    </div>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-inbox" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-message p-2"></i>
                                        <p>Bandeja de entrada</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin/reported/comments" className="nav-link text-white d-flex align-items-center">
                                        <i class="fa-solid fa-comment-medical p-2"></i>
                                        <p>Comentarios denunciados</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla y menu izquierdo */}
            <div style={{ margin: '30px 100px', border: '1px solid #eeeeee' }}>
                <div className="d-flex" style={{ margin: '30px 90px' }}>
                    <div className="d-flex flex-column">
                        <div className="d-flex justify-content-start align-items-center"> 
                            <p onClick={() => handlerActiveArticles()} style={{ fontWeight: articlesIsActive ? 'bold' : 'normal', marginBottom: '2px', marginRight: '10px', cursor: 'pointer' }}>Articulos</p>
                            <i class="fa-solid fa-caret-right" style={{display: articlesIsActive ? 'block' : 'none'}}></i>
                        </div>
                        <div className="d-flex justify-content-start align-items-center">
                            <p onClick={() => handlerActiveVideos()} style={{ fontWeight: videosIsActive ? 'bold' : 'normal', marginBottom: '2px', marginRight: '10px', cursor: 'pointer'}}>Videos</p>
                            <i class="fa-solid fa-caret-right" style={{display: videosIsActive ? 'block' : 'none'}}></i>
                        </div>
                    </div>
                    <div className="w-100" style={{ marginLeft: '60px' }}>
                        {articlesIsActive &&
                            <div id="pending_articles" className="">
                                <h4 className="mb-3">Articulos pendientes de aprobación</h4>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Titulo</th>
                                                <th>Usuario </th>
                                                <th>Genero</th>
                                                <th>Pais</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                articlesUpdates.length > 0 ? (
                                                    articlesUpdates.map((item, index) => (
                                                        <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleArticleReview(item)}>
                                                            <td>{item.titulo}</td>
                                                            <td>{item.user.usuario}</td>
                                                            <td>{item.genero}</td>
                                                            <td>{item.pais}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td>
                                                            <p>No hay articulos pendientes de aprobación</p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        }
                        {videosIsActive &&
                            <div id="pending_videos" className="">
                                <h4 className="mb-3">Videos pendientes de aprobación</h4>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Articulo</th>
                                                <th>Usuario</th>
                                                <th>Cambios</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { videoUpdates &&
                                                videoUpdates.length > 0 ? (
                                                    videoUpdates.map((update, index) => {
                                                        const cambios = update.cambios_data.length
                                                        return (
                                                            <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleVideoUpdateReview(update)}>
                                                                <td>{update.articulo_titulo}</td>
                                                                <td>Id. {update.user_id} - {update.usuario}</td>
                                                                <td>{cambios}</td>
                                                                <td>{update.fecha}</td>
                                                            </tr>
                                                        )
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td>
                                                            <p>No hay videos pendientes de aprobación</p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

    );
};
