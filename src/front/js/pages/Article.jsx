import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../store/appContext";
import * as Yup from 'yup';
import Select from "react-select";
import AsyncSelect from "react-select/async";

const Article = ({ mode }) => {
    const { actions, store } = useContext(Context);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [genres, setGenres] = useState([]);
    const article = mode ? store.articleToEdit : null;
    const [successNoti, setSuccessNoti] = useState(false);
    const [errorNoti, setErrorNoti] = useState(false);
    let imageFile = null;

    useEffect(() => {
        const fetchGenres = async () => {
            const response = await actions.getGenres();
            console.log(response);
            const option_genres = response.map((genre) => ({
                label: genre.name,
                value: genre.name
            }));
            setGenres(option_genres);
        }

        fetchGenres();
    }, []);

    const initialValues = {
        titulo: '',
        sello: '',
        formato: '',
        pais: '',
        publicado: '',
        genero: '',
        estilos: '',
        artista_id: ''
    };

    if (mode && mode === "edit") {
        initialValues.titulo = article.titulo;
        initialValues.sello = article.sello;
        initialValues.formato = article.formato;
        initialValues.pais = article.pais;
        initialValues.publicado = article.publicado;
        initialValues.genero = {
            label: article.genero,
            value: article.genero
        }
        initialValues.estilos = article.estilos;
        initialValues.url_imagen = article.url_imagen;

        const [artist, title] = article.titulo.split(' - ')
        initialValues.artista_id = {
            label: artist,
            value: article.artista_id
        }
    }

    const validationSchema = Yup.object().shape({
        titulo: Yup.string().required("Campo requerido"),
        sello: Yup.string().required("Campo requerido"),
        pais: Yup.string().required("Campo requerido"),
        publicado: Yup.string().required("Campo requerido"),
        genero: Yup.mixed().required("Campo requerido"),
        artista_id: Yup.mixed().required("Campo requerido"),
    });

    const loadArtists = async (inputValue) => {
        try {
            if (inputValue.length >= 2) {
                const response = await actions.getAllArtistsLikeName(inputValue);
                console.log(JSON.stringify(response));
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
        console.log("handleImageUpload triggered");
        console.log(event.target.files[0]);
        imageFile = event.target.files[0];
    }

    const handleSubmit = async (values, { resetForm }) => {
        setIsSubmitting(true);

        if (mode && mode === "edit") {
            values.id = article.id;
            values.tipo = "edit";
        } else {
            values.tipo = "add";
        }            

        values.genero = values.genero.value;
        values.artista_id = values.artista_id.value;
        values.user_id = localStorage.getItem('userID');
        console.log("values: " + JSON.stringify(values));

        setTimeout(async () => {
            try {
                const response_data = await actions.addArticleForApproval(values, imageFile);
                console.log("values: " + JSON.stringify(values));

                console.log("Success");
                setIsSubmitting(false);
                setSuccessNoti(true);
                mode = null;
                resetForm();
            } catch (error) {
                console.log(error);
                setIsSubmitting(false);
                setErrorNoti(true);
                resetForm();
            }

        }, 2000);

        setTimeout(() => {
            setSuccessNoti(false);
            setErrorNoti(false);
        }, 6000);

    };

    return (
        <div className="container">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <div className="row">
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
                                <div>
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

                                <button className="form-control btn btn-success mt-3" type="submit">
                                    {isSubmitting ? 'Procesando...' : "Enviar"}
                                </button>
                            </Form>
                        </div>
                    </div>
                )}
            </Formik>
        </div>
    );
}

export default Article;