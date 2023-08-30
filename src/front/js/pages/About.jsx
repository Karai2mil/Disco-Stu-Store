import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PayPalDonation from "../component/PayPalDonation.jsx";

const validationSchema = Yup.object().shape({
    user_name: Yup.string().required("Este campo es requerido"),
    user_email: Yup.string()
        .email("Correo electrónico inválido")
        .required("Este campo es requerido"),
    message: Yup.string().required("Este campo es requerido"),
});

const About = () => {

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
        <div>
            <div>
                {/* Jumbotron o Header */}
                <section className="jumbotron py-4 text-center bg-black text-white mb-5">
                    <div className="container text-center">
                        <h1 className="jumbotron-heading mb-4">Disco Stu Store</h1>
                        <p className="mb-5" style={{fontSize: '1.1rem'}}>
                            El proyecto ‘Disco Stu Store’ busca crear una aplicación web al
                            estilo eCommerce para compra, venta y publicación de artículos de
                            registro musical como vinilos, cassettes y cd’s. La página brinda
                            un servicio de intercambio entre compradores y vendedores para
                            coordinar la entrega de los paquetes a cualquier parte del mundo,
                            facilitando el acceso a distintos artículos para personas que no
                            tengan la posibilidad de obtenerlos localmente. Además, las
                            características de la página generan una comunidad de intercambio
                            de música, con usuarios habilitados a agregar nuevos artículos y a
                            editar los artículos existentes.
                        </p>
                    </div>
                </section>


                {/* Formulario de contacto */}
                <div className="container my-4">
                    <main>
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-lg-8 col-md-10">
                                <div className="card border-0">
                                    <div className="row g-0">
                                        <div className="col-md-5">
                                            <img
                                                src="https://images.unsplash.com/photo-1619983081563-430f63602796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                                                alt="Imagen"
                                                className="img-fluid"
                                            />
                                        </div>
                                        <div className="col-md-7">
                                            <div className="card-body">
                                                <h1 className="card-title text-center mb-4">
                                                    Contactanos
                                                </h1>
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
                                                                        className="btn btn-outline-success btn-block"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Enviar comentario
                                                                    </button>
                                                                </div>
                                                                <p className="text-center mt-3">
                                                                    <Link
                                                                        to="/"
                                                                        className="btn btn-outline-dark btn-block"
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

            </div>
        </div >
    );
};

export default About;

// Descomentar todo con chatgpt en caso de querer usarlo
{/* <div> */}
    {/* Seccion Integrantes */}
    {/* <div className="container mt-4 text-center"> */}
    {/* <h2 className="fs-2 m-4">Disco Stu Team</h2> */}
    {/* Three columns of text below the carousel */}
    {/* <div className="row g-4"> */}
    {/* <div className="col-lg-4 p-4"> */}
        {/* Perfil 1 */}
        {/* <img */}
        {/*     className="rounded-circle mb-4" */}
        {/*     src="https://picsum.photos/200/300?random=5" */}
        {/*     alt="Profile picture 1" */}
        {/*     width="140" */}
        {/*     height="140" */}
        {/* /> */}
        {/* <h2>Andres</h2> */}
        {/* <p> */}
            {/* Rol y enlaces de perfil de Andres */}
            {/* <p className="text-muted">Full Stack Web Developer</p> */}
            {/* <ul className="list-group text-start list-group-flush"> */}
                {/* Enlace al perfil de GitHub de Andres */}
                {/* <i className="fa-brands fa-github nav-link"></i> */}
                {/* Enlace al perfil de LinkedIn de Andres */}
                {/* <i className="fa-brands fa-linkedin nav-link"></i> */}
            {/* </ul> */}
        {/* </p> */}
    {/* </div> */}
    {/* <div className="col-lg-4 p-4"> */}
        {/* Perfil 2 */}
        {/* <img */}
        {/*     className="rounded-circle mb-4" */}
        {/*     src="https://picsum.photos/200/300?random=6" */}
        {/*     alt="Profile picture 2" */}
        {/*     width="140" */}
        {/*     height="140" */}
        {/* /> */}
        {/* <h2>Karai</h2> */}
        {/* <p> */}
            {/* Rol y enlaces de perfil de Karai */}
            {/* <p className="text-muted">Full Stack Web Developer</p> */}
            {/* <ul className="list-group text-start list-group-flush"> */}
                {/* Enlace al perfil de GitHub de Karai */}
                {/* <i className="fa-brands fa-github nav-link"></i> */}
                {/* Enlace al perfil de LinkedIn de Karai */}
                {/* <i className="fa-brands fa-linkedin nav-link"></i> */}
            {/* </ul> */}
        {/* </p> */}
    {/* </div> */}
    {/* <div className="col-lg-4 p-4"> */}
        {/* Perfil 3 */}
        {/* <img */}
        {/*     className="rounded-circle mb-4" */}
        {/*     src="https://picsum.photos/200/300?random=7" */}
        {/*     alt="Profile picture 3" */}
        {/*     width="140" */}
        {/*     height="140" */}
        {/* /> */}
        {/* <h2>Fercho</h2> */}
        {/* <p> */}
            {/* Rol y enlaces de perfil de Fercho */}
            {/* <p className="text-muted">Full Stack Web Developer</p> */}
            {/* <ul className="list-group text-start list-group-flush"> */}
                {/* Enlace al perfil de GitHub de Fercho */}
                {/* <i className="fa-brands fa-github nav-link"></i> */}
                {/* Enlace al perfil de LinkedIn de Fercho */}
                {/* <i className="fa-brands fa-linkedin nav-link"></i> */}
            {/* </ul> */}
        {/* </p> */}
    {/* </div> */}
    {/* </div> */}
    {/* </div> */}
// </div>
