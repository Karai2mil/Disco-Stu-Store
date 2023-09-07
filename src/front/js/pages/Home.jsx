import React, { useContext, useEffect, useState } from "react";
import "../../styles/home.css";
import { Carousel } from 'react-bootstrap';
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { Collapse } from 'react-bootstrap';
import logoVendedorBlanco from '../../img/DISCOSTUVENDEDORESBLANCO.png'
import logoFondoBlanco from '../../img/LOGOFONDOBLANCO.png'

const Home = () => {
    const { actions } = useContext(Context)
    const [articles, setArticles] = useState({});
    const [curiosities, setCuriosities] = useState([]);
    const [carouselPaused, setCarouselPaused] = useState(false);
    const [collapseStates, setCollapseStates] = useState(Array(curiosities.length).fill(false));
    const [collapseActivated, setCollapseActivated] = useState('')
    const [isSeller, setIsSeller] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const articles_response = await actions.getAllArticlesGroupedByGenre();
            setArticles(articles_response);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const curiosities_response = await actions.getCuriosities();
            setCuriosities(curiosities_response);
        };

        fetchData();
    }, []);

    useEffect(() => {
        let current = 0;
        let autoUpdate = true;
        const timeTrans = 5000;

        const init = (item) => {
            const items = item.querySelectorAll("li");

            const nav = document.createElement("nav");
            nav.className = "nav_arrows";

            const prevbtn = document.createElement("button");
            prevbtn.className = "prev";
            prevbtn.setAttribute("aria-label", "Prev");

            const nextbtn = document.createElement("button");
            nextbtn.className = "next";
            nextbtn.setAttribute("aria-label", "Next");

            const counter = document.createElement("div");
            counter.className = "counter";
            counter.innerHTML = "<span>1</span><span>" + items.length + "</span>";

            if (items.length > 1) {
                nav.appendChild(prevbtn);
                nav.appendChild(counter);
                nav.appendChild(nextbtn);
                item.appendChild(nav);
            }

            items[current].className = "current";
            if (items.length > 1) items[items.length - 1].className = "prev_slide";

            const navigate = (dir) => {
                items[current].className = "";

                if (dir === "right") {
                    current = current < items.length - 1 ? current + 1 : 0;
                } else {
                    current = current > 0 ? current - 1 : items.length - 1;
                }

                const nextCurrent =
                    current < items.length - 1 ? current + 1 : 0;
                const prevCurrent = current > 0 ? current - 1 : items.length - 1;

                // Delay changing opacity and transform
                setTimeout(() => {
                    items[current].className = "current";
                    items[prevCurrent].className = "prev_slide";
                    items[nextCurrent].className = "";
                }, 50); // Adjust the delay as needed

                counter.firstChild.textContent = current + 1;
            };

            item.addEventListener("mouseenter", () => {
                autoUpdate = false;
            });

            item.addEventListener("mouseleave", () => {
                autoUpdate = true;
            });

            setInterval(() => {
                if (autoUpdate) navigate("right");
            }, timeTrans);

            prevbtn.addEventListener("click", () => {
                navigate("left");
            });

            nextbtn.addEventListener("click", () => {
                navigate("right");
            });

            document.addEventListener("keydown", (ev) => {
                const keyCode = ev.keyCode || ev.which;
                switch (keyCode) {
                    case 37:
                        navigate("left");
                        break;
                    case 39:
                        navigate("right");
                        break;
                }
            });

            item.addEventListener("touchstart", handleTouchStart, false);
            item.addEventListener("touchmove", handleTouchMove, false);
            let xDown = null;
            let yDown = null;
            const handleTouchStart = (evt) => {
                xDown = evt.touches[0].clientX;
                yDown = evt.touches[0].clientY;
            };
            const handleTouchMove = (evt) => {
                if (!xDown || !yDown) {
                    return;
                }

                const xUp = evt.touches[0].clientX;
                const yUp = evt.touches[0].clientY;

                const xDiff = xDown - xUp;
                const yDiff = yDown - yUp;

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    if (xDiff > 0) {
                        navigate("right");
                    } else {
                        navigate("left");
                    }
                }
                xDown = null;
                yDown = null;
            };
        };

        const sliderElements = document.querySelectorAll(".cd-slider");
        sliderElements.forEach((item) => {
            init(item);
        });
    }, []);

    const createSlides = (albums) => {
        const itemsPerSlide = 5;
        const slides = [];
        for (let i = 0; i < albums.length; i += itemsPerSlide) {
            const slideAlbums = albums.slice(i, i + itemsPerSlide);
            const slide = (
                <Carousel.Item key={i}>
                    <div className="d-flex album-container">
                        {slideAlbums.map((album, albumIndex) => {
                            const [artista, articulo] = album.titulo.split(' - ');

                            return (
                                <div
                                    key={i + albumIndex}
                                    className="mr-3 album-item"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        // Handle your navigation logic here
                                        navigate(`/article/${album.id}`);
                                        localStorage.setItem('currentArticle', JSON.stringify(album));
                                    }}
                                >
                                    <div className="image-container">
                                        <div
                                            className="img-wrapper"
                                            style={{ backgroundImage: `url(${album.url_imagen})` }}
                                        ></div>
                                    </div>
                                    <div className="text-container">
                                        <p className="ellipsis" style={{ color: 'white' }}>{articulo}</p>
                                        <p className="ellipsis" style={{ color: 'white' }}>{artista}</p>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                </Carousel.Item>
            );
            slides.push(slide);
        }
        return slides;
    };

    const toggleCollapse = (index) => {
        setCollapseActivated(index)
        const newCollapseStates = [...collapseStates];
        newCollapseStates[index] = !newCollapseStates[index];
        setCollapseStates(newCollapseStates);

        // Pausar o reanudar el carrusel dependiendo del estado del colapso
        setCarouselPaused(!carouselPaused);
    };

    const handlerNavigateToAbout = () => {
        navigate('/about')
    }
    const handlerNavigateToBecameSeller = () => {
        navigate('/sellers')
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
                    }
                });
        };
        sellerValidation()
    }), []

    return (
        <div className="container-fluid" style={{ padding: 0 }}>
            <div style={{backgroundColor: 'black', paddingTop: '30px'}}>
                {/* <h3 className="curiosidadesMusicalesH3">Curiosidades musicales</h3> */}
                <div className="cd-slider" style={{ backgroundColor: "black", height: "400px", marginBottom: "0px" }}>
                    <ul>
                        <li>
                            <div className="image" style={{ backgroundImage: curiosities[0] ? `url(${curiosities[0].url_imagen})` : 'none' }}>
                                {!curiosities[0] && <p>Cargando imagen...</p>}
                            </div>
                            <div className="content">
                                <h2 className="shadowed-text">
                                    <font color="white">{curiosities[0] ? curiosities[0].titulo : 'Cargando título...'}</font>
                                </h2>
                                <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(0)}>Ver Detalles</button>
                            </div>
                        </li>
                        <li>
                            <div className="image" style={{ backgroundImage: curiosities[1] ? `url(${curiosities[1].url_imagen})` : 'none' }}>
                                {!curiosities[1] && <p>Cargando imagen...</p>}
                            </div>
                            <div className="content">
                                <h2 className="shadowed-text">
                                    <font color="white">{curiosities[1] ? curiosities[1].titulo : 'Cargando título...'}</font>
                                </h2>
                                <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(1)}>Ver Detalles</button>
                            </div>
                        </li>
                        <li>
                            <div className="image" style={{ backgroundImage: curiosities[2] ? `url(${curiosities[2].url_imagen})` : 'none' }}>
                                {!curiosities[2] && <p>Cargando imagen...</p>}
                            </div>
                            <div className="content">
                                <h2 className="shadowed-text">
                                    <font color="white">{curiosities[2] ? curiosities[2].titulo : 'Cargando título...'}</font>
                                </h2>
                                <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(2)}>Ver Detalles</button>
                            </div>
                        </li>
                        <li>
                            <div className="image" style={{ backgroundImage: curiosities[3] ? `url(${curiosities[3].url_imagen})` : 'none' }}>
                                {!curiosities[3] && <p>Cargando imagen...</p>}
                            </div>
                            <div className="content">
                                <h2 className="shadowed-text">
                                    <font color="white">{curiosities[3] ? curiosities[3].titulo : 'Cargando título...'}</font>
                                </h2>
                                <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(3)}>Ver Detalles</button>
                            </div>
                        </li>
                        <li>
                            <div className="image" style={{ backgroundImage: curiosities[4] ? `url(${curiosities[4].url_imagen})` : 'none' }}>
                                {!curiosities[4] && <p>Cargando imagen...</p>}
                            </div>
                            <div className="content">
                                <h2 className="shadowed-text">
                                    <font color="white">{curiosities[4] ? curiosities[4].titulo : 'Cargando título...'}</font>
                                </h2>
                                <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(4)}>Ver Detalles</button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div style={{ padding: '20px 80px' }}>
                    <Collapse in={collapseStates[collapseActivated]}>
                        <div>
                            <div className="d-flex align-itmes-center justify-content-center text-center">
                                <h4 style={{color: 'white'}}><strong>{curiosities[collapseActivated]?.subtitulo}</strong></h4>
                            </div>
                            <div className="column-container">
                                <img style={{ width: '100%', margin: '10px 0px' }} src={curiosities[collapseActivated]?.url_imagen} alt="Imagen de curiosidad" />
                                <p style={{ color: 'white', textAlign: 'justify' }}>{curiosities[collapseActivated]?.descripcion}</p>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </div>
            <div id='title' style={{ backgroundColor: 'white', width: '100%', margin: 0, flexDirection: 'column' }} className='titleAndInfo'>
                {isSeller ?
                    (<img style={{width: '400px'}} src={logoVendedorBlanco} alt="" />) :
                    (<img style={{width: '400px'}} src={logoFondoBlanco} alt="" />)
                }
                <div className="d-flex w-100 justify-content-between">
                    <button onClick={() => handlerNavigateToAbout()} type="button" className="btn btn-dark" style={{ marginLeft: '80px', width: '240px' }}>Sobre nosotros</button>
                    <button onClick={() => handlerNavigateToBecameSeller()} type="button" className="btn btn-dark" style={{ marginRight: '80px', width: '240px' }}>Convertirme en vendedor</button>
                </div>

            </div>
            <div className="divArticles">
                <h3>Articulos recientes</h3>
                {Object.entries(articles).map(([genre, albums], index) => (
                    <div key={index}>
                        <h5 style={{ marginTop: '30px' }}>{genre}</h5>
                        <Carousel interval={null}>{createSlides(albums)}</Carousel>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Home;



// import React, { useContext, useEffect, useState } from "react";
// import "../../styles/home.css";
// import { Carousel } from 'react-bootstrap';
// import { Context } from "../store/appContext";
// import { useNavigate } from "react-router-dom";
// import { Collapse } from 'react-bootstrap';
// import logo from '../../img/LOGO2.png'
// import logoVendedor from '../../img/DISCOSTUVENDEDORES.png'

// const Home = () => {
//     const { actions } = useContext(Context)
//     const [articles, setArticles] = useState({});
//     const [curiosities, setCuriosities] = useState([]);
//     const [carouselPaused, setCarouselPaused] = useState(false);
//     const [collapseStates, setCollapseStates] = useState(Array(curiosities.length).fill(false));
//     const [collapseActivated, setCollapseActivated] = useState('')
//     const [isSeller, setIsSeller] = useState(false)
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchData = async () => {
//             const articles_response = await actions.getAllArticlesGroupedByGenre();
//             setArticles(articles_response);
//             //console.log("articles: " + JSON.stringify(articles_response));
//         };

//         fetchData();
//     }, []);

//     useEffect(() => {
//         const fetchData = async () => {
//             const curiosities_response = await actions.getCuriosities();
//             setCuriosities(curiosities_response);
//             console.log(curiosities_response)
//             //console.log("articles: " + JSON.stringify(articles_response));
//         };

//         fetchData();
//     }, []);

//     useEffect(() => {
//         let current = 0;
//         let autoUpdate = true;
//         const timeTrans = 5000;

//         const init = (item) => {
//             const items = item.querySelectorAll("li");

//             const nav = document.createElement("nav");
//             nav.className = "nav_arrows";

//             const prevbtn = document.createElement("button");
//             prevbtn.className = "prev";
//             prevbtn.setAttribute("aria-label", "Prev");

//             const nextbtn = document.createElement("button");
//             nextbtn.className = "next";
//             nextbtn.setAttribute("aria-label", "Next");

//             const counter = document.createElement("div");
//             counter.className = "counter";
//             counter.innerHTML = "<span>1</span><span>" + items.length + "</span>";

//             if (items.length > 1) {
//                 nav.appendChild(prevbtn);
//                 nav.appendChild(counter);
//                 nav.appendChild(nextbtn);
//                 item.appendChild(nav);
//             }

//             items[current].className = "current";
//             if (items.length > 1) items[items.length - 1].className = "prev_slide";

//             const navigate = (dir) => {
//                 items[current].className = "";

//                 if (dir === "right") {
//                     current = current < items.length - 1 ? current + 1 : 0;
//                 } else {
//                     current = current > 0 ? current - 1 : items.length - 1;
//                 }

//                 const nextCurrent =
//                     current < items.length - 1 ? current + 1 : 0;
//                 const prevCurrent = current > 0 ? current - 1 : items.length - 1;

//                 // Delay changing opacity and transform
//                 setTimeout(() => {
//                     items[current].className = "current";
//                     items[prevCurrent].className = "prev_slide";
//                     items[nextCurrent].className = "";
//                 }, 50); // Adjust the delay as needed

//                 counter.firstChild.textContent = current + 1;
//             };

//             item.addEventListener("mouseenter", () => {
//                 autoUpdate = false;
//             });

//             item.addEventListener("mouseleave", () => {
//                 autoUpdate = true;
//             });

//             setInterval(() => {
//                 if (autoUpdate) navigate("right");
//             }, timeTrans);

//             prevbtn.addEventListener("click", () => {
//                 navigate("left");
//             });

//             nextbtn.addEventListener("click", () => {
//                 navigate("right");
//             });

//             document.addEventListener("keydown", (ev) => {
//                 const keyCode = ev.keyCode || ev.which;
//                 switch (keyCode) {
//                     case 37:
//                         navigate("left");
//                         break;
//                     case 39:
//                         navigate("right");
//                         break;
//                 }
//             });

//             item.addEventListener("touchstart", handleTouchStart, false);
//             item.addEventListener("touchmove", handleTouchMove, false);
//             let xDown = null;
//             let yDown = null;
//             const handleTouchStart = (evt) => {
//                 xDown = evt.touches[0].clientX;
//                 yDown = evt.touches[0].clientY;
//             };
//             const handleTouchMove = (evt) => {
//                 if (!xDown || !yDown) {
//                     return;
//                 }

//                 const xUp = evt.touches[0].clientX;
//                 const yUp = evt.touches[0].clientY;

//                 const xDiff = xDown - xUp;
//                 const yDiff = yDown - yUp;

//                 if (Math.abs(xDiff) > Math.abs(yDiff)) {
//                     if (xDiff > 0) {
//                         navigate("right");
//                     } else {
//                         navigate("left");
//                     }
//                 }
//                 xDown = null;
//                 yDown = null;
//             };
//         };

//         const sliderElements = document.querySelectorAll(".cd-slider");
//         sliderElements.forEach((item) => {
//             init(item);
//         });
//     }, []);

//     const createSlides = (albums) => {
//         const itemsPerSlide = 5;
//         const slides = [];
//         for (let i = 0; i < albums.length; i += itemsPerSlide) {
//             const slideAlbums = albums.slice(i, i + itemsPerSlide);
//             const slide = (
//                 <Carousel.Item key={i}>
//                     <div className="d-flex album-container">
//                         {slideAlbums.map((album, albumIndex) => {
//                             const [artista, articulo] = album.titulo.split(' - ');

//                             return (
//                                 <div
//                                     key={i + albumIndex}
//                                     className="mr-3 album-item"
//                                     onClick={() => {
//                                         // Handle your navigation logic here
//                                         // navigate(`/article/${album.id}`);
//                                         // localStorage.setItem('currentArticle', JSON.stringify(album));
//                                     }}
//                                 >
//                                     <div className="image-container">
//                                         <div
//                                             className="img-wrapper"
//                                             style={{ backgroundImage: `url(${album.url_imagen})` }}
//                                         ></div>
//                                     </div>
//                                     <div className="text-container">
//                                         <p className="ellipsis" style={{ color: 'white' }}>{articulo}</p>
//                                         <p className="ellipsis" style={{ color: 'white' }}>{artista}</p>
//                                     </div>

//                                 </div>
//                             )
//                         })}
//                     </div>
//                 </Carousel.Item>
//             );
//             slides.push(slide);
//         }
//         return slides;
//     };

//     const toggleCollapse = (index) => {
//         setCollapseActivated(index)
//         const newCollapseStates = [...collapseStates];
//         newCollapseStates[index] = !newCollapseStates[index];
//         setCollapseStates(newCollapseStates);

//         // Pausar o reanudar el carrusel dependiendo del estado del colapso
//         setCarouselPaused(!carouselPaused);
//     };

//     const handlerNavigateToAbout = () => {
//         navigate('/about')
//     }
//     const handlerNavigateToBecameSeller = () => {
//         navigate('/sellers')
//     }

//     useEffect(() => {
//         const sellerValidation = async () => {
//             const user_id = localStorage.getItem('userID')
//             const backendUrl = process.env.BACKEND_URL + `api/users/validate_seller/${user_id}`;
//             return await fetch(backendUrl, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                 }
//             })
//                 .then((response) => response.json())
//                 .then((result) => {
//                     if (result == 'VALIDATED') {
//                         setIsSeller(true)
//                     }
//                 });
//         };
//         sellerValidation()
//     }), []

//     return (
//         <div className="container-fluid" style={{ padding: 0 }}>
//             <div id='title' style={{ backgroundColor: 'black', width: '100%', margin: 0, flexDirection: 'column' }} className='titleAndInfo'>
//                 {isSeller ?
//                     (<img src={logoVendedor} alt="" />) :
//                     (<img style={{width: '300px'}} src={logo} alt="" />)
//                 }
//                 <div className="d-flex mb-5 w-100 justify-content-between">
//                     <button onClick={() => handlerNavigateToAbout()} type="button" className="btn btn-light" style={{ marginLeft: '80px', width: '240px' }}>Sobre nosotros</button>
//                     <button onClick={() => handlerNavigateToBecameSeller()} type="button" className="btn btn-light" style={{ marginRight: '80px', width: '240px' }}>Convertirme en vendedor</button>
//                 </div>

//             </div>
//             <h3 className="curiosidadesMusicalesH3">Curiosidades musicales</h3>
//             <div className="cd-slider" style={{ background: "black", height: "400px", marginTop: "20px", marginBottom: "0px" }}>
//                 <ul>
//                     <li>
//                         <div className="image" style={{ backgroundImage: curiosities[0] ? `url(${curiosities[0].url_imagen})` : 'none' }}>
//                             {!curiosities[0] && <p>Cargando imagen...</p>}
//                         </div>
//                         <div className="content">
//                             <h2 className="shadowed-text">
//                                 <font color="white">{curiosities[0] ? curiosities[0].titulo : 'Cargando título...'}</font>
//                             </h2>
//                             <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(0)}>Ver Detalles</button>
//                         </div>
//                     </li>
//                     <li>
//                         <div className="image" style={{ backgroundImage: curiosities[1] ? `url(${curiosities[1].url_imagen})` : 'none' }}>
//                             {!curiosities[1] && <p>Cargando imagen...</p>}
//                         </div>
//                         <div className="content">
//                             <h2 className="shadowed-text">
//                                 <font color="white">{curiosities[1] ? curiosities[1].titulo : 'Cargando título...'}</font>
//                             </h2>
//                             <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(1)}>Ver Detalles</button>
//                         </div>
//                     </li>
//                     <li>
//                         <div className="image" style={{ backgroundImage: curiosities[2] ? `url(${curiosities[2].url_imagen})` : 'none' }}>
//                             {!curiosities[2] && <p>Cargando imagen...</p>}
//                         </div>
//                         <div className="content">
//                             <h2 className="shadowed-text">
//                                 <font color="white">{curiosities[2] ? curiosities[2].titulo : 'Cargando título...'}</font>
//                             </h2>
//                             <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(2)}>Ver Detalles</button>
//                         </div>
//                     </li>
//                     <li>
//                         <div className="image" style={{ backgroundImage: curiosities[3] ? `url(${curiosities[3].url_imagen})` : 'none' }}>
//                             {!curiosities[3] && <p>Cargando imagen...</p>}
//                         </div>
//                         <div className="content">
//                             <h2 className="shadowed-text">
//                                 <font color="white">{curiosities[3] ? curiosities[3].titulo : 'Cargando título...'}</font>
//                             </h2>
//                             <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(3)}>Ver Detalles</button>
//                         </div>
//                     </li>
//                     <li>
//                         <div className="image" style={{ backgroundImage: curiosities[4] ? `url(${curiosities[4].url_imagen})` : 'none' }}>
//                             {!curiosities[4] && <p>Cargando imagen...</p>}
//                         </div>
//                         <div className="content">
//                             <h2 className="shadowed-text">
//                                 <font color="white">{curiosities[4] ? curiosities[4].titulo : 'Cargando título...'}</font>
//                             </h2>
//                             <button className="btn btn-warning btn-lg verDetallesBtn" onClick={() => toggleCollapse(4)}>Ver Detalles</button>
//                         </div>
//                     </li>
//                 </ul>
//             </div>
//             <div style={{ padding: '20px 80px' }}>
//                 <Collapse in={collapseStates[collapseActivated]}>
//                     <div>
//                         <div className="d-flex align-itmes-center justify-content-center text-center">
//                             <h4><strong>{curiosities[collapseActivated]?.subtitulo}</strong></h4>
//                         </div>
//                         <div className="column-container">
//                             <img style={{ width: '100%', margin: '10px 0px' }} src={curiosities[collapseActivated]?.url_imagen} alt="Imagen de curiosidad" />
//                             <p style={{ color: 'black', textAlign: 'justify' }}>{curiosities[collapseActivated]?.descripcion}</p>
//                         </div>
//                     </div>
//                 </Collapse>
//             </div> 
//             <div className="divArticles">
//                 <h3>Articulos recientes</h3>
//                 {Object.entries(articles).map(([genre, albums], index) => (
//                     <div key={index}>
//                         <h5 style={{ marginTop: '30px' }}>{genre}</h5>
//                         <Carousel interval={null}>{createSlides(albums)}</Carousel>
//                     </div>
//                 ))}
//             </div>
//         </div >
//     );
// };

// export default Home;


