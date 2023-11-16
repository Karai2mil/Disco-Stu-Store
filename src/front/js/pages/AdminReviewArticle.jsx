import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export const ArticleReview = ({ id }) => {
    const { actions, store } = useContext(Context);
    const [articleInReview, setArticleInReview] = useState(null)
    const navigate = useNavigate();

    useEffect(() => {
        const article = store.articleInReview
        console.log(article)
        setArticleInReview(article);
    }, [articleInReview]);

    const handleAddArticle = async () => {
        try {
            const data = await actions.addApprovedArticle(articleInReview);
            Swal.fire({
                title: 'Artículo ha sido agregado satisfactoriamente',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                upateSessionStoragePendingApprovals();
                navigate('/approvals');
            });
        } catch (error) {
            Swal.fire({
                title: 'Artículo no pudo ser agregado',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            });
        }

    }

    const handleRejectArticle = async () => {
        try {
            const data = await actions.rejectArticle(articleInReview);
            Swal.fire({
                title: 'Artículo ha sido marcado como rechazado',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                upateSessionStoragePendingApprovals();
                navigate('/approvals');
            });
        } catch (error) {
            Swal.fire({
                title: 'La aprobación no pudo rechazarse, intentelo de nuevo',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            });
        }

    }

    const upateSessionStoragePendingApprovals = () => {
        const currentPendingApprovals = sessionStorage.getItem('pendingApprovals');
        const newPendingApprovals = parseInt(currentPendingApprovals, 10) - 1;
        sessionStorage.setItem('pendingApprovals', newPendingApprovals.toString());
        window.postMessage({ type: "pendingApprovalsUpdated", value: newPendingApprovals }, "*");
    }

    return (
        <div className="container-fluid p-0">
            {/* Encabezado */}
            <div className="container-fluid px-0 mx-0">
                <div className="card border-0 rounded-0">
                    <div
                        className="p-4 text-black"
                        style={{ backgroundColor: "black" }}
                    >
                        <h3 style={{ color: 'white' }} className="text-center">Revisión de artículo</h3>
                        <div className="d-flex justify-content-end text-center py-1">
                        </div>
                    </div>
                    <div className="card-body p-4 text-black"></div>
                </div>
            </div>

            <div className="container mt-3" style={{ marginBottom: '212px' }}>
                {articleInReview && (
                    <div key={articleInReview.id} className="row">
                        <div className="col-md-4">
                            <img src={articleInReview.url_imagen} alt="{articleInReview.title}"
                                className="img-fluid" />
                        </div>
                        <div className="col-md-6">
                            <div className="row mb-3">
                                <div className="col-md-7">
                                    <h3>{articleInReview.titulo}</h3>
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>ID:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.id}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Arista:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.artista_id}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Sello:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.sello}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Formato:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.formato}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>País:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.pais}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Publicado:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.publicado}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Género:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.genero}
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-2">
                                    <strong>Estilos:</strong>
                                </div>
                                <div className="col-md-3">
                                    {articleInReview.estilos}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div>
                                <button
                                    className="btn btn-light w-100"
                                    onClick={() => {
                                        Swal.fire({
                                            title: '¿Estás seguro de aprobar este artículo?',
                                            text: 'Esta acción no se puede deshacer.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Sí, aprobar',
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                handleAddArticle();
                                            }
                                        });
                                    }}
                                >
                                    <i className="fa-solid fa-check"></i> Aprobar
                                </button>
                                <button
                                    className="btn btn-light mt-3 w-100"
                                    onClick={() => {
                                        Swal.fire({
                                            title: '¿Estás seguro de rechazar este artículo?',
                                            text: 'Esta acción no se puede deshacer.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Sí, rechazar',
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                handleRejectArticle();
                                            }
                                        });
                                    }}
                                >
                                    <i className="fa-solid fa-trash"></i> Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div>

    )
}

