import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    user_name: Yup.string().required("Este campo es requerido"),
    user_email: Yup.string()
        .email("Correo electrónico inválido")
        .required("Este campo es requerido"),
    message: Yup.string().required("Este campo es requerido"),
});

export const Contact = () => {
    const form = useRef();

    const sendEmail = (values, actions) => {
        // const sendEmail = (e) => {
        //   e.preventDefault();
        emailjs
            .sendForm(
                "service_il4v6lq",
                "template_vev8q6p",
                form.current,
                "G42tcz5fPT6yFbD8o"
            )
            .then(
                (result) => {
                    Swal.fire({
                        icon: "success",
                        title: "Mensaje enviado",
                        text: "Tu mensaje ha sido enviado correctamente.",
                    });
                    actions.resetForm();
                },
                (error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Error al enviar el mensaje",
                        text: "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
                    });
                }
            );
    };

    return (
        <div className="container mt-3">
            <main>
                <div className="row">
                    <div className="col-lg-3 col-md-3 col-sm-2 col-xs-3"></div>
                    <div className="col-lg-6 col-md-6 col-sm-8 col-xs-6">
                        <h1 className="text-center mb-4">Contactanos</h1>
                        <Formik
                            initialValues={{
                                user_name: "",
                                user_email: "",
                                message: "",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={sendEmail}
                        >
                            {({ isSubmitting }) => (
                                <Form ref={form}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="user_name">Nombre</label>
                                        <Field
                                            className="form-control mt-2"
                                            type="text"
                                            name="user_name"
                                            id="user_name"
                                        />
                                        <ErrorMessage
                                            name="user_name"
                                            component="div"
                                            className="error-message"
                                        />
                                        <label htmlFor="user_email">Correo</label>
                                        <Field
                                            className="form-control mt-2"
                                            type="email"
                                            name="user_email"
                                            id="user_email"
                                        />
                                        <ErrorMessage
                                            name="user_email"
                                            component="div"
                                            className="error-message"
                                        />
                                        <label htmlFor="message">Mensaje</label>
                                        <Field
                                            as="textarea"
                                            className="form-control mt-2"
                                            name="message"
                                            id="message"
                                        />
                                        <ErrorMessage
                                            name="message"
                                            component="div"
                                            className="error-message"
                                        />
                                        <div className="d-grid gap-2 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-success btn-block"
                                                disabled={isSubmitting}
                                            >
                                                Enviar comentario
                                            </button>
                                        </div>
                                        <p className="text-center mt-3">
                                            <Link
                                                to="/"
                                                className="nav-link active mt-2"
                                                type="button"
                                            >
                                                Regresar a Inicio
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </main>
        </div>
    );
};
