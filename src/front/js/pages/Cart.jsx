import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import CartComponent from '../component/CartComponent.jsx'
import noCart from '../../img/carroVacio.png'


const Cart = () => {

    const { store, actions } = useContext(Context)
    const numOffers = store.cart.reduce((totalOffers, element) => totalOffers + element.offers.length, 0);

    useEffect(() => {
        actions.getCart();
    }, []);

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-md-12 mt-4' style={{ marginLeft: '30px' }}>
                    <h5 style={{ margin: 0 }}><strong>Tienes {numOffers} aticulos de {store.cart.length} vendedores</strong></h5>
                </div>
                {
                    store.cart.length > 0 ? (
                        store.cart.map((element, index) => (
                            <div key={element.id} className='col-md-12 d-flex justify-content-center align-items-center'>
                                <CartComponent
                                    data={element}
                                />
                            </div>
                        ))) : (
                        <div className='d-flex justify-content-center align-items-center flex-column'>
                            <img style={{ width: '500px', marginLeft: 'auto', marginRight: 'auto', marginTop: '100px' }} src={noCart} alt="" />
                            <h1>No tienes articulos en el carrito</h1>
                        </div>

                    )
                }
            </div>
        </div>
    )
}



export default Cart