import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Este campo es requerido').email('Formato de correo inválido'),
});

const ForgotPassword = () => {
    const { actions } = useContext(Context);
    const [email, setEmail] = useState('');

    const handleFormSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await actions.forgotPassword(values.email);

            Swal.fire({
                icon: 'success',
                title: 'Correo enviado',
                text: 'Se han enviado las instrucciones de restablecimiento a tu correo electrónico.',
            });

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al enviar el correo de restablecimiento. Por favor, intenta de nuevo más tarde.',
            });
        } finally {
            setSubmitting(false); // Asegurarse de que el botón de envío se habilite nuevamente
        }
    };

    return (
        <Container id="page" className="mt-3">
            <div id="page_content" role="main">
                <h2>Olvidaste tu contraseña</h2>
                <p className="my-3">
                    Introduce la dirección de correo electrónico asociada con tu cuenta de Disco Stu. Las instrucciones para el restablecimiento de la contraseña se enviarán por correo electrónico.
                </p>
                <p className="my-3">
                    Si no tienes una cuenta de Disco Stu, <Link to="/signup">crea una</Link>.
                </p>
                <Card className="fluid-card">
                    <Card.Body className='p-0'>
                        <Card.Header className="bg-gray">
                            <Card.Title className='mt-1'>Obtener contraseña</Card.Title>
                        </Card.Header>
                        <Formik
                            initialValues={{
                                email: '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {({ isSubmitting, handleSubmit }) => (
                                <Form noValidate className='m-3' onSubmit={handleSubmit}>
                                    <Form.Group controlId="email">
                                        <Form.Label>Dirección de correo electrónico</Form.Label>
                                        <Field type="email" name="email" className="form-control" />
                                        <ErrorMessage name="email" component="div" className="text-danger" />
                                    </Form.Group>
                                    <button type="submit" name="Action.EmailResetInstructions" className="btn btn-success mt-3" disabled={isSubmitting}>
                                        <i className="fa-solid fa-envelope me-3"></i>
                                        Envíame las instrucciones por correo electrónico
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default ForgotPassword;
