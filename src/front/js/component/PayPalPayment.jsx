import React, { useContext } from 'react'
import { Context } from '../store/appContext'
import { PayPalButtons } from "@paypal/react-paypal-js";
import Swal from 'sweetalert2';

const PaymentComponent = ({ orderID, cost, updatePageData, seller_id, ofertas_ids }) => {
    const { store, actions } = useContext(Context);

    const createOrder = async (data) => {
        // Order is created on the server and the order id is returned
        const backendUrl = process.env.BACKEND_URL + `api/payment/create-paypal-order`;
        return await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product skus and quantities 
            body: JSON.stringify({
                orderID: orderID,
                user_id: seller_id,
                cost: cost,
                isDonation: false
            }),
        })
            .then((response) => response.json())
            .then((order) => order.id);
    };

    const onApprove = async (data) => {
        try {
            const user_id = localStorage.getItem('userID');
            const backendUrl = process.env.BACKEND_URL + `api/payment/capture-paypal-order`;

            const response = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderID: data.orderID,
                    user_id: seller_id,
                    isDonation: false
                })
            });

            const responseData = await response.json();

            console.log('Payment response:', responseData);

            if (responseData.status === 'COMPLETED') {
                const nuevo_estado_pagado = true;
                const pedido_id = orderID;
                await actions.deleteOffer(ofertas_ids)
                await actions.updatePaymentStatus({ orderID: pedido_id, nuevo_estado_pagado });

                Swal.fire({
                    icon: 'success',
                    title: 'Pago exitoso',
                    text: 'Tu pago ha sido procesado exitosamente. El vendedor se pondra en contacto para hacer entrega de la orden',
                    confirmButtonText: 'Aceptar',
                    timer: 5000,
                    timerProgressBar: true
                }).then(() => {
                    updatePageData();
                });

            }

        } catch (error) {
            console.error('Error capturing payment:', error);
        }
    };

    return (
        <PayPalButtons
            createOrder={(data, actions) => createOrder(data, actions)}
            onApprove={(data, actions) => onApprove(data, actions)}
        />
    );
}



export default PaymentComponent