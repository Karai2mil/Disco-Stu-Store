import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../../styles/home.css";
import sindeseos from '../../img/sindeseos.png'

export const UserFavorites = () => {
    const { actions } = useContext(Context);
    const [favoritesData, setFavoritesData] = useState([])
    const user_id = localStorage.getItem('userID')
    const [articleIds, setArticleIds] = useState([]);
    const [artistData, setArtistData] = useState([]);
    const [articlesData, setArticlesData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await actions.getFavoritesByUserId(user_id);

                setFavoritesData(response);

            } catch (error) {
                console.error("Error al obtener los favoritos:", error);
            }
        };

        fetchFavorites();
    }, [user_id, actions]);

    useEffect(() => {
        if (favoritesData.favorites) {
            const ids = favoritesData.favorites.map(favorite => favorite.articulo_id);
            setArticleIds(ids);
        }
    }, [favoritesData.favorites]);

    const fetchAndSetArticles = async () => {
        try {
            const response = await actions.getAllArticles();

            setArticlesData(response);

        } catch (error) {
        }
    };

    const fetchAndSetArtists = async () => {
        try {
            const response = await actions.getAllArtists();

            setArtistData(response);

        } catch (error) {
        }
    };

    useEffect(() => {
        fetchAndSetArtists();
        fetchAndSetArticles();
    }, []);

    const handleDelete = async (user_id, article_id, favorite_id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción eliminará el favorito. ¿Deseas continuar?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                await actions.deleteFavorite(user_id, article_id);
                const updatedFavorites = favoritesData.favorites.filter(favorite => favorite.id !== favorite_id);
                setFavoritesData({ ...favoritesData, favorites: updatedFavorites });
            }

        } catch (error) {
            console.error('Error deleting favorite:', error);
        }
    };

    const handleImageClick = (article) => {
        if (article && article.id) {
            navigate(`/article/${article.id}`);
            localStorage.setItem('currentArticle', JSON.stringify(article));
        }
    };

    return (
        <div>
            <div className="card border-0 rounded-0">
                <div className=" text-white d-flex flex-row" style={{ backgroundColor: '#000', height: '100px' }}>
                    <div className="ms-3" style={{ marginTop: '130px' }}>
                    </div>
                </div>
            </div>
            <div
                className="p-4 text-black"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                <h3 className="text-center">Lista de favoritos</h3>
                <div className="d-flex justify-content-end text-center py-1">
                </div>
            </div>

            {
                articleIds.length > 0 ? (
                    <div className="container">
                        <div className="row">
                            {articleIds.map((articleId, index) => {
                                const favorite = favoritesData.favorites.find(fav => fav.articulo_id === articleId);
                                const article = articlesData.find(article => article.id === articleId);
                                const artist = artistData.find(artist => artist.id === (article ? article.id : null))

                                if (!article) {
                                    // Si no se encuentra el artículo, mostrar un mensaje de "No encontrado"
                                    return (
                                        <div key={`not-found-${index}`} className="col-md-3 mb-4">
                                            <div className="card d-flex flex-column align-items-center justify-content-center">
                                                <p>No encontrado</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={`${articleId}-${index}`} className="col-md-3 mb-4">
                                        <div className="card d-flex flex-column">
                                            <span onClick={() => handleImageClick(article)} style={{ cursor: 'pointer' }}>
                                                <img src={article ? article.url_imagen : 'ruta-de-imagen-por-defecto.jpg'} alt={article ? article.title : 'Título no disponible'} className="card-img-top img-fluid" />
                                            </span>
                                            <div className="card-body d-flex flex-column align-items-center">
                                                <button className="btn btn-sm btn-dark position-absolute top-0 start-0 m-2" onClick={() => handleDelete(user_id, articleId, favorite.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                <h5 className="card-title">{article ? article.titulo : 'Título no disponible'}</h5>
                                                <p className="card-text">Género: {article ? article.genero : 'Género no disponible'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className='d-flex' style={{width: '100%'}}>
                        <img style={{width: '100%', marginBottom: '39px'}} src={sindeseos} alt="" />
                    </div>
                )
            }
            <div className="text-center" style={{marginBottom: '39px'}}>
                <button className="btn btn-outline-dark" onClick={() => navigate('/explorer')}>
                    Regresar al Explorador
                </button>
            </div>
        </div >

    );
};