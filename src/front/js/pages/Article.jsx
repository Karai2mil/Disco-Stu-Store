import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/appContext";
import * as Yup from 'yup';
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Swal from 'sweetalert2';

const Article = ({ mode }) => {
    const { actions, store } = useContext(Context);
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [genres, setGenres] = useState([]);
    //const article = mode ? localStorage.getItem('currentArticle') : null;}
    const [article, setArticle] = useState(null);
    const [initialValues, setInitialValues] = useState(null);
    const [successNoti, setSuccessNoti] = useState(false);
    const [errorNoti, setErrorNoti] = useState(false);
    let imageFile = null;

    useEffect(() => {
        const currentArticle = localStorage.getItem('currentArticle');
        const article = JSON.parse(currentArticle);

        if (article && mode == 'edit') {
            setArticle(article);

            let values = {};
            values.titulo = article.titulo;
            values.sello = article.sello;
            values.formato = article.formato;
            values.pais = article.pais;
            values.publicado = article.publicado;
            values.genero = {
                label: article.genero,
                value: article.genero
            }
            values.estilos = article.estilos;
            values.url_imagen = article.url_imagen;

            const [artist, title] = article.titulo.split(' - ')
            values.artista_id = {
                label: artist,
                value: article.artista_id
            }
            setInitialValues(values);
        } else {
            setInitialValues({
                titulo: '',
                sello: '',
                formato: '',
                pais: '',
                publicado: '',
                genero: '',
                estilos: '',
                artista_id: ''
            });
        }
    }, [])

    useEffect(() => {
        const fetchGenres = async () => {
            const response = await actions.getGenres();
            const option_genres = response.map((genre) => ({
                label: genre.name,
                value: genre.name
            }));
            setGenres(option_genres);
        }

        fetchGenres();
    }, []);

    const validationSchema = Yup.object().shape({
        titulo: Yup.string().required("Campo requerido"),
        sello: Yup.string().required("Campo requerido"),
        pais: Yup.string().required("Campo requerido"),
        publicado: Yup.string().required("Campo requerido"),
        genero: Yup.mixed().required("Campo requerido"),
        artista_id: Yup.mixed().required("Campo requerido")
    });

    const loadArtists = async (inputValue) => {
        try {
            if (inputValue.length >= 2) {
                const response = await actions.getAllArtistsLikeName(inputValue);
                return response.map((artist) => ({
                    label: artist.nombre,
                    value: artist.id
                }));
            } else {
                return [];
            }

        } catch (error) {
            console.error("Error loading artists: " + error);
            return [];
        }
    }

    const handleImageUpload = (event) => {
        imageFile = event.target.files[0];
        console.log("iamge file is loaded: " + imageFile);
    }

    const handleSubmit = async (values, { resetForm }) => {
        setIsSubmitting(true);

        if (mode && mode === "edit") {
            values.articulo_id = article.id;
            values.tipo = "edit";
        } else {
            values.tipo = "add";
        }

        values.genero = values.genero.value;
        values.artista_id = values.artista_id.value;
        values.user_id = localStorage.getItem('userID');

        setTimeout(async () => {
            try {
                const response_data = await actions.addArticleForApproval(values, imageFile);
                setIsSubmitting(false);
                setSuccessNoti(true);
                mode = null;
                resetForm();
                Swal.fire({
                    icon: 'success',
                    title: 'Artículo guardado satisfactoriamente.',
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (error) {
                console.log(error);
                setIsSubmitting(false);
                setErrorNoti(true);
                resetForm();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar el artículo',
                    showConfirmButton: false,
                    timer: 2000
                });
            }

        }, 2000);

        setTimeout(() => {
            setSuccessNoti(false);
            setErrorNoti(false);
        }, 6000);

    };

    return (
        initialValues && (
            <div className="container mt-4 mb-4">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue }) => (
                        <div className="row">
                            <div className="col-md-6 offset-md-3 mb-3">
                                {mode && mode === 'edit' ? (
                                    <h2>Editar artículo</h2>
                                ) : (
                                    <h2>Alta de artículo</h2>
                                )}
                            </div>
                            <div className="col-md-6 offset-md-3">
                                {successNoti && (
                                    <div className="row mt-3">
                                        <div className="alert alert-success" role="alert">
                                            Artículo guardado satisfatoriamente.
                                        </div>
                                    </div>
                                )}
                                {errorNoti && (
                                    <div className="row mt-3">
                                        <div className="alert alert-danger" role="alert">
                                            Error al guardar el artículo
                                        </div>
                                    </div>
                                )}
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="titulo">Título</label>
                                        <Field className="form-control" type="text" id="titulo" name="titulo" />
                                        <ErrorMessage name="titulo" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="sello">Sello</label>
                                        <Field className="form-control" type="text" id="sello" name="sello" />
                                        <ErrorMessage name="sello" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="formato">Formato</label>
                                        <Field className="form-control" type="text" id="formato" name="formato" />
                                        <ErrorMessage name="formato" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="pais">País</label>
                                        <Field className="form-control" type="text" id="pais" name="pais" />
                                        <ErrorMessage name="pais" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="publicado">Publicado</label>
                                        <Field className="form-control" type="text" id="publicado" name="publicado" />
                                        <ErrorMessage name="publicado" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="genero">Género</label>
                                        <Field
                                            as={Select}
                                            id="genero"
                                            name="genero"
                                            options={genres}
                                            value={values.genero}
                                            onChange={(selectedOption) => setFieldValue("genero", selectedOption)}
                                        />
                                        <ErrorMessage name="genero" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="estilos">Estilos</label>
                                        <Field className="form-control" type="text" id="estilos" name="estilos" />
                                        <ErrorMessage name="estilos" component="div" className="text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="artista_id">Artista</label>
                                        <AsyncSelect
                                            id="artista_id"
                                            name="artista_id"
                                            cacheOptions
                                            defaultOptions
                                            loadOptions={loadArtists}
                                            value={values.artista_id}
                                            onChange={(selectedOption) => setFieldValue("artista_id", selectedOption)}
                                        />
                                        <ErrorMessage name="artista_id" component="div" className="text-danger" />
                                    </div>
                                    <div className="row mt-3 align-items-center h-100">
                                        <div className="col-8">
                                            <label htmlFor="url_imagen">Foto</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="url_imagen"
                                                name="url_imagen"
                                                onChange={(e) => handleImageUpload(e)}
                                            />
                                            <ErrorMessage name="url_imagen" component="div" className="text-danger" />
                                        </div>
                                        {mode == "edit" && article && (
                                            <div className="col-4">
                                                <img src={article.url_imagen} width={200} height={200} />
                                            </div>
                                        )}
                                    </div>
                                    <button className="form-control btn btn-success mt-3" type="submit">
                                        {isSubmitting ? 'Procesando...' : "Enviar"}
                                    </button>
                                    <button
                                        className="form-control btn btn-outline-dark mt-3 mr-2"
                                        type="button"
                                        onClick={() => navigate('/explorer')}
                                    >
                                        Regresar
                                    </button>
                                </Form>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
        )
    )
}

export default Article;