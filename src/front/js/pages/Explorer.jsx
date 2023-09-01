import React, { useEffect, useContext, useState } from 'react'
import { Context } from '../store/appContext'
import styles from "../../styles/Explorer.module.css";
import ArticleCard from '../component/ArticleCardExplorer.jsx';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link, useNavigate } from 'react-router-dom';


const Explorer = () => {
    const { store, actions } = useContext(Context);
    const [filter, setFilter] = useState(null);
    const navigate = useNavigate();
    const backendUrl = process.env.BACKEND_URL + "/api/articles";
    const [generos, setGeneros] = useState(null);
    const [estilos, setEstilos] = useState(null);
    const [paises, setPaises] = useState(null);
    const [articles, setArticles] = useState(null);

    useEffect(() => {
        if (store.searchResults) {
            setArticles(store.searchResults);
        }
    }, [store.searchResults])

    useEffect(() => {
        const fetchArticles = async () => {
            if (store.searchResults && store.searchResults.length > 0) {
                setArticles(store.searchResults);
            } else {
                const data = await actions.getAllArticles();
                setArticles(data);
            }
        }


        const fetchFiltros = async () => {
            const result = await fetch(backendUrl + "/get_all_filter", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await result.json();

            setGeneros(Array.from(new Set(data.generos)).sort());
            setEstilos(Array.from(new Set(data.estilos)).sort());
            setPaises(Array.from(new Set(data.paises)).sort());
        };
        fetchFiltros();
        fetchArticles();
    }, [])

    const handleFetchGeneros = async (genero) => {
        const response = await fetch(backendUrl + "/genre/" + genero, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (data) {
            setArticles(data);
            scrollTop();
        }
    }

    const handleFetchEstilos = async (estilo) => {
        const response = await fetch(backendUrl + "/style/" + estilo, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (data) {
            setArticles(data);
            scrollTop();
        }
    }
    const handleFetchPaises = async (pais) => {
        const response = await fetch(backendUrl + "/country/" + pais, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (data) {
            setArticles(data);
            scrollTop();
        }
    }

    function scrollTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <div id='general_div' className={styles.generalDiv}>
            <div id='filter_center' className={styles.filterCenter}>
                <div id='genres_filters' className='mb-3'>
                    <p><strong>Género</strong></p>
                    {generos && generos.map((genero, index) => (
                        <p onClick={() => handleFetchGeneros(genero)} style={{ cursor: 'pointer' }}>{genero}</p>
                    ))}
                </div>
                <div id='styles_filters' className='mb-3'>
                    <p><strong>Estilo</strong></p>
                    {estilos && estilos.map((estilo, index) => (
                        <p onClick={() => handleFetchEstilos(estilo)} style={{ cursor: 'pointer' }}>{estilo}</p>
                    ))}
                </div>
                <div id='country_filters'>
                    <p><strong>Pais</strong></p>
                    {paises && paises.map((pais, index) => (
                        <p onClick={() => handleFetchPaises(pais)} style={{ cursor: 'pointer' }}>{pais}</p>
                    ))}
                </div>
            </div>
            <div id='content_center' className={styles.contentCenter}>
                <div className='d-flex justify-content-between'>
                    <h4>Explorar articulos y artistas</h4>
                    <div id='button-section' style={{marginRight: '76px'}}>
                        <Link className='btn btn-dark mb-3' to={'/articles/add'}>Agregar nuevo artículo</Link>
                    </div>
                </div>

                <div id='content'>
                    <ul className={styles.content}>
                        {articles &&
                            articles.map((element, index) => {
                                const [artist, title] = element.titulo.split(' - ')
                                return (
                                    <li key={element.id}>
                                        <div onClick={() => { navigate(`/article/${element.id}`); localStorage.setItem('currentArticle', JSON.stringify(element)); }} style={{ cursor: 'pointer' }}>
                                            <ArticleCard
                                                title={title}
                                                artist={artist}
                                                url_imagen={element.url_imagen}
                                            />
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </div >
    )
}


export default Explorer