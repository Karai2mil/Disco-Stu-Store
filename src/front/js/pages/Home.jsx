import React, { useContext } from "react";
import ArticleCard from '../component/ArticleCard.jsx'
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { object } from "prop-types";

const Home = () => {

    const objeto = {
        'titulo': 'Las esperanzas mas esperanzadas',
        'artista': 'Jose Pedro Buena Vista'
    }

    const array = [1, 2, 3, 4, 5, 6]

    return (
        <div>
            <div id="presentation" style={{ width: '100%', height: '230px', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <h1 style={{ color: 'white' }}>DISCO STU STORE</h1>
                <p style={{ width: '80%', color: 'white', textAlign: 'center' }}>Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas "Letraset", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.</p>
            </div>
            <div id="top_information" style={{ width: '100%', height: '450px', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h5 style={{ color: 'white', marginBottom: 'auto', marginRight: 'auto', marginLeft: '120px' }}><strong>Curiosidades musicales</strong></h5>
                <div id="general_div" style={{ width: '85%', display: 'flex', height: '380px', position: 'absolute' }}>
                    <div id="main_box" style={{ width: '65%', height: '100%', display: 'flex', alignItems: 'center', }}>
                        <img style={{ width: '100%', height: '100%' }} src="https://es.rollingstone.com/wp-content/uploads/2023/01/vinilo-bandeja.jpg" alt="" />
                    </div>
                    <div id="secondary_box" style={{ width: '33%', marginLeft: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ height: '30%' }}>
                            <img style={{ height: '100%', width: '100%' }} src="https://rnz-ressh.cloudinary.com/image/upload/s--AlSPyWni--/c_scale,f_auto,q_auto,w_1050/v1643833786/4M6M278_image_crop_127384" alt="" />
                        </div>
                        <div style={{ height: '30%' }}>
                            <img style={{ height: '100%', width: '100%' }} src="https://media.pitchfork.com/photos/5f5a4de8f5e6f1d3e7d3d6ce/2:1/w_2560%2Cc_limit/Vinyl%2520records.png" alt="" />
                        </div>
                        <div style={{ height: '30%' }}>
                            <img style={{ height: '100%', width: '100%' }} src="https://wololosound.com/wp-content/uploads/djs-techno-maestros-del-vinilo.jpg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <div id="recent_published" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
                <h5 style={{ paddinigBottom: 'auto', marginRight: 'auto', marginLeft: '120px', marginTop: '30px' }}><strong>Articulos recientes</strong></h5>
                <p style={{ paddingBottom: 'auto', marginRight: 'auto', marginLeft: '100px', marginTop: '5px', marginBottom: '0px', fontSize: '18px' }}>Electrónica</p>
                <div style={{ display: 'flex', overflowX: 'scroll', width: '90%', height: '270px'}}>
                    
                    {
                        array.map((element, index) => (
                            <ArticleCard
                                key={index}
                                title={objeto.titulo}
                                artist={objeto.artista}
                            />
                        ))
                    }
                </div>
                <p style={{ paddingBottom: 'auto', marginRight: 'auto', marginLeft: '100px', marginTop: '5px', marginBottom: '0px', fontSize: '18px' }}>Rock</p>
                <div style={{ display: 'flex', overflowX: 'scroll', width: '90%', height: '270px'}}>
                    
                    {
                        array.map((element, index) => (
                            <ArticleCard
                                key={index}
                                title={objeto.titulo}
                                artist={objeto.artista}
                            />
                        ))
                    }
                </div>
                <p style={{ paddingBottom: 'auto', marginRight: 'auto', marginLeft: '100px', marginTop: '5px', marginBottom: '0px', fontSize: '18px' }}>Pop</p>
                <div style={{ display: 'flex', overflowX: 'scroll', width: '90%', height: '270px'}}>
                    
                    {
                        array.map((element, index) => (
                            <ArticleCard
                                key={index}
                                title={objeto.titulo}
                                artist={objeto.artista}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Home