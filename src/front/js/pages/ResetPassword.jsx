import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    new_password: Yup.string().required('Este campo es requerido').min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password'), null], 'Las contraseñas deben coincidir')
        .required('Este campo es requerido'),
});

const ResetPassword = () => {
    const { reset_token } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (values, { setSubmitting }) => {
        try {
            setIsLoading(true);

            const response = await fetch(`/api/users/reset_password/${reset_token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: values.new_password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Contraseña restablecida',
                    text: 'Tu contraseña ha sido restablecida exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                });
            } else {
                // Handle error response
                Swal.fire({
                    title: 'Error',
                    text: data.error || 'Ocurrió un error al restablecer la contraseña',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <Container id="page" className="mt-3">
            <div id="page_content" role="main">
                <h2>Restablecer Contraseña</h2>
                <p>Ingresa tu nueva contraseña.</p>
                <Card className="fluid-card">
                    <Card.Body className='p-0'>
                        <Card.Header className="bg-gray">
                            <Card.Title className='mt-1'>Restablecer Contraseña</Card.Title>
                        </Card.Header>
                        <Formik
                            initialValues={{
                                new_password: '',
                                confirm_password: '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form noValidate className='m-3'>
                                    <Form.Group controlId="new_password">
                                        <Form.Label>Nueva Contraseña</Form.Label>
                                        <Field type="password" name="new_password" className="form-control" />
                                        <ErrorMessage name="new_password" component="div" className="text-danger" />
                                    </Form.Group>
                                    <Form.Group controlId="confirm_password">
                                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                        <Field type="password" name="confirm_password" className="form-control" />
                                        <ErrorMessage name="confirm_password" component="div" className="text-danger" />
                                    </Form.Group>
                                    <Button type="submit" className="btn btn-primary" disabled={isSubmitting || isLoading}>
                                        {isLoading ? 'Cargando...' : 'Restablecer Contraseña'}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default ResetPassword;
