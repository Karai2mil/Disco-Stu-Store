import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate, Link } from 'react-router-dom';


const EditHome = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [posicion, setPosicion] = useState('')
    const [titulo, setTitulo] = useState('')
    const [subtitulo, setSubtitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [imagen, setImagen] = useState(null)
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
        sessionStorage.getItem("pendingApprovals") || 0
    );

    useEffect(() => {
        const fetchPendingArticles = async () => {
            const pendingArticleApprovals = await actions.getArticleForApproval();
            const pendingVideoApprovals = await actions.getVideoUpdates();

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

    const handlePosicion = (e) => {
        setPosicion(e.target.value)
    }
    const handleTitulo = (e) => {
        setTitulo(e.target.value)
    }
    const handleSubtitulo = (e) => {
        setSubtitulo(e.target.value)
    }
    const handleDescripcion = (e) => {
        setDescripcion(e.target.value)
    }
    const handleImagen = (e) => {
        setImagen(e.target.files[0])
    }

    const handlerNewCuriositie = async () => {
        const formData = new FormData();
        formData.append('posicion', posicion);
        formData.append('titulo', titulo);
        formData.append('subtitulo', subtitulo);
        formData.append('descripcion', descripcion);
        formData.append('imagen', imagen);
        const response = await actions.addCuriositie(formData)
        if (response.status == 'COMPLETED') {
            navigate('/')
        }
    }

    return (
        <div className="container-flui">
            {/* Encabezado */}
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
                                    <div className="d-flex justify-content-center">
                                        <i className="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
                                    </div>
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
            <div className="container" style={{ margin: '30px 100px', border: '1px solid #eeeeee' }}>
                <div className="row" style={{ margin: '30px 70px' }}>
                    <div id='curiosities'>
                        <h3>Editar curiosidades</h3>
                        <div style={{ marginTop: '20px' }}>
                            <label htmlFor="posicion">Posicion del recuadro</label>
                            <select onChange={(e) => handlePosicion(e)} value={posicion} className="form-select form-select-sm" id='posicion' aria-label="Small select example" style={{ width: '14rem' }}>
                                <option value="">Seleccionar posicion</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div className='d-flex flex-column'>
                            <label htmlFor="titulo">Título</label>
                            <input onChange={(e) => handleTitulo(e)} value={titulo} type="text" id='titulo' />
                        </div>
                        <div className='d-flex flex-column'>
                            <label htmlFor="subtitulo">Subtítulo</label>
                            <input onChange={(e) => handleSubtitulo(e)} value={subtitulo} type="text" id='subtitulo' />
                        </div>
                        <div className='d-flex flex-column'>
                            <label htmlFor="descripcion">Descripción</label>
                            <input onChange={(e) => handleDescripcion(e)} value={descripcion} type="text" id='descripcion' maxLength='4000' />
                        </div>
                        <div className='d-flex flex-column'>
                            <label htmlFor="imagen">Imagen</label>
                            <input onChange={(e) => handleImagen(e)} type="file" id='imagen' accept="image/*" />
                        </div>
                        <div style={{ marginLeft: '64.8rem', marginTop: '10px' }}>
                            <button onClick={() => handlerNewCuriositie()} type="button" className="btn btn-dark">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default EditHome