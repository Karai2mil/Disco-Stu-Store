import React, { useContext, useState, useEffect } from 'react'
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const UserComposeMessage = () => {
    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [messageTo, setMessageTo] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({
        messageTo: '',
        subject: '',
        message: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await actions.getAllUsersInfo();
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error.message);
            }
        };
        fetchUsers();
    }, [actions]);

    const handleNavigateInbox = () => {
        navigate('/messages')
    }
    const handleNavigateSent = () => {
        navigate('/messages/sent')
    }
    const handleNavigateTrash = () => {
        navigate('/messages/trash')
    }

    const handleNavigateOrders = () => {
        navigate('/user-orders')
    }

    const handleMessageTo = (value) => {
        setMessageTo(value);
        setFormErrors({ ...formErrors, messageTo: '' });
    };

    const handleSubject = (value) => {
        setSubject(value);
        setFormErrors({ ...formErrors, subject: '' });
    };

    const handleMessage = (value) => {
        setMessage(value);
        setFormErrors({ ...formErrors, message: '' });
    };

    const validateForm = () => {
        const newErrors = {
            messageTo: '',
            subject: '',
            message: '',
        };

        let isValid = true;

        if (messageTo.trim() === '') {
            newErrors.messageTo = 'El campo "Enviar mensaje a" es obligatorio.';
            isValid = false;
        }

        if (subject.trim() === '') {
            newErrors.subject = 'El campo "Asunto" es obligatorio.';
            isValid = false;
        }

        if (message.trim() === '') {
            newErrors.message = 'El campo "Mensaje" es obligatorio.';
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleSendMessage = async () => {
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }
        try {
            const fechaActual = new Date();
            const dia = fechaActual.getDate().toString().padStart(2, '0');
            const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
            const fecha = `${dia}/${mes}/${fechaActual.getFullYear()}`;
            const senderID = localStorage.getItem('userID');

            let message_data = {};

            const receptor = users.find((user) => user.username === messageTo);
            if (receptor) {
                message_data = {
                    receptor_id: receptor.id,
                    asunto: subject,
                    mensaje: message,
                    fecha: fecha,
                };
            }

            const result = await Swal.fire({
                title: '¿Enviar mensaje?',
                text: '¿Estás seguro de que deseas enviar este mensaje?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                // Lógica para enviar el mensaje
                await actions.sendMessage(senderID, message_data);

                Swal.fire({
                    title: '¡Mensaje enviado!',
                    text: 'El mensaje se ha enviado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    // Redirigir a la página de mensajes
                    navigate('/messages');
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="card bg-black rounded-0 border-0">
                <div
                    className="text-white d-flex flex-row w-100 border-0"
                >
                    <div
                        className="ms-4 mt-5 d-flex flex-column"
                        style={{ width: "150px" }}
                    ></div>
                    <div className="ms-3" style={{ marginTop: "130px" }}></div>
                </div>
                <div
                    className="p-4 text-black"
                    style={{ backgroundColor: "#f8f9fa" }}
                >
                    <h3 className="text-center">Mensajes</h3>
                    <div className="d-flex justify-content-end text-center py-1">
                    </div>
                </div>
            </div>
            <div>
                <div className="container-fluid" style={{ margin: '30px' }}>
                    <div className="row me-3">
                        <div className="col-md-3">
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Pedidos</button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div id='messages_center'>
                                <div className="border rounded p-3">
                                    <fieldset>
                                        <legend className="bg-light p-2"><strong>Crear un nuevo mensaje</strong></legend>
                                        <form onSubmit={handleSendMessage}>
                                            <div className="p-3">
                                                <div className={`mb-3 form-group ${formErrors.messageTo && 'has-error'}`}>
                                                    <label htmlFor="to">Enviar mensaje a</label>
                                                    <input
                                                        onChange={(e) => handleMessageTo(e.target.value)}
                                                        id="to"
                                                        name="to"
                                                        className="form-control"
                                                        required={true}
                                                        size="50"
                                                        type="text"
                                                        value={messageTo}
                                                    />
                                                    {formErrors.messageTo && <div className="error">{formErrors.messageTo}</div>}
                                                </div>
                                                <div className={`mb-3 form-group ${formErrors.subject && 'has-error'}`}>
                                                    <label htmlFor="subject">Asunto</label>
                                                    <div className="d-flex">
                                                        <input
                                                            onChange={(e) => handleSubject(e.target.value)}
                                                            id="subject"
                                                            name="subject"
                                                            className="form-control"
                                                            required={true}
                                                            size="80"
                                                            type="text"
                                                            value={subject}
                                                        />
                                                    </div>
                                                    {formErrors.subject && <div className="error">{formErrors.subject}</div>}
                                                </div>
                                                <div className={`mb-3 form-group ${formErrors.message && 'has-error'}`}>
                                                    <label htmlFor="message">Mensaje</label>
                                                    <textarea
                                                        onChange={(e) => handleMessage(e.target.value)}
                                                        style={{ height: '150px' }}
                                                        className="form-control"
                                                        id="message"
                                                        maxLength="1600"
                                                        name="message"
                                                        value={message}
                                                    />
                                                    {formErrors.message && <div className="error">{formErrors.message}</div>}
                                                </div>
                                                <div className='d-flex justify-content-end'>
                                                    <button
                                                        onClick={() => handleSendMessage()}
                                                        className="btn btn-outline-dark "
                                                        disabled={isSubmitting}
                                                    >
                                                        Enviar
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
