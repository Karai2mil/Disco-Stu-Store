import React from 'react'
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';



const PayPalDonation = () => {

    const navigate=useNavigate()

    const generateUniqueOrderID = () => {
        const currentDate = new Date();
        const randomSuffix = Math.floor(Math.random() * 1000); // Genera un número aleatorio entre 0 y 999
        const orderID = `ORDER-${currentDate.getTime()}-${randomSuffix}`;
        return orderID;
    }

    const orderID = generateUniqueOrderID()

    const createOrder = async (data) => {
        // Order is created on the server and the order id is returned
        const user_id = localStorage.getItem('userID')
        const backendUrl = process.env.BACKEND_URL + 'api/payment/create-paypal-order';
        return await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product skus and quantities 
            body: JSON.stringify({
                    orderID: orderID,
                    user_id: null,
                    cost: '10',
                    isDonation: true
            }),
        })
            .then((response) => response.json())
            .then((order) => order.id);
    };
    const onApprove = async (data) => {
        // Order is captured on the server and the response is returned to the browser
        const user_id = localStorage.getItem('userID')
        const backendUrl = process.env.BACKEND_URL + `api/payment/capture-paypal-order`;
        return await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID: data.orderID,
                isDonation: true
            })
        })
        .then((response) => response.json())
        .then((responseData) => {
            
            //Convertimos al usuario en vendedor
            if (responseData.status == 'COMPLETED') {
                const becameSeller = async () => {
                    try{
                        // const token = localStorage.getItem('token');
                        const backendUrl = process.env.BACKEND_URL + `api/users/became_seller/${user_id}`;
                        return await fetch(backendUrl, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                // Authorization: `Bearer ${token}`,
                            },
                        })
                        .then((responseUser) => responseUser.json())
                        .then((data) => {
                            if (data == 'COMPLETED') {
                                navigate('/')
                            }
                        })
                    }catch(error){
                        console.log('Error on becaming seller', error)
                    }
                }
                becameSeller()
            }

        })
        .catch((error) => {
            console.error('Error capturing payment:', error);
        });
    };

    return (
        <PayPalButtons
            createOrder={(data, actions) => createOrder(data, actions)}
            onApprove={(data, actions) => onApprove(data, actions)}
        />
    );
}



export default PayPalDonation