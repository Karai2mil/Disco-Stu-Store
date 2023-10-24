import React from 'react'
import fondo from '../../img/DISCOSTUVENDEDORES.png'
import pagasUnaVez from "../../img/PAGASUNAVEZ.png"
import navbar from "../../img/CAPTURANAVBAR.png"
import perfil from "../../img/CAPTURAPERFIL.png"
import PayPalDonation from '../component/PayPalDonation.jsx'





const InitializeAsSeller = () => {



    return (
        <div style={{background: 'black', padding: '2% 0%' }}>
            <div className='container' id="presentation" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <img style={{ width: '600px', marginTop: '10px' }} src={fondo} alt="" />
                <img style={{ width: '800px' }} src={pagasUnaVez} alt="" />
                <div className='row'>
                    <div className='col-md-6 d-flex flex-column justify-content-center align-items-center mt-5'>
                        <p style={{ width: '80%', color: 'white', textAlign: 'center', paddingTop: '25px', paddingBottom: '25px' }}>
                            DiscoStu Store ofrece su mercado de venta online para aquellos usuarios avocados al comercio musical. El costo de usuario vendedor tiene como fines únicos el mantenimiento de la página y el crecimiento de esta comunidad.
                        </p>
                        <p style={{ width: '80%', color: 'white', textAlign: 'center', paddingTop: '10px', paddingBottom: '25px' }}>
                            El usuario vendedor tiene la posibilidad de publicar articulos en venta de forma ilimitada. Accede a estos recursos abonando 10 USD de forma ÚNICA.
                        </p>
                        <div id='paypal_buttons' style={{ width: '250px' }}>
                            <PayPalDonation />
                        </div>
                    </div>
                    <div className='col-md-6 d-flex flex-column align-items-center mt-5'>
                        <h5 style={{ width: '80%', color: 'white', textAlign: 'center', margin: '25px 0px' }}>Registra tu información de pagos y comienza a vender</h5>
                        <div>
                            <p style={{ color: 'white' }}>1) Ingresa a tu perfil</p>
                            <img style={{ width: '100px', marginBottom: '25px' }} src={navbar} alt="" />
                        </div>
                        <div className='d-flex flex-column align-items-center'>
                            <p style={{ color: 'white' }}>2) Conectate con PayPal</p>
                            <img style={{ width: '80%', marginBottom: '69px' }} src={perfil} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default InitializeAsSeller