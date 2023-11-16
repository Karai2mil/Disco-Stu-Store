import React from 'react'
import styles from "../../styles/Explorer.module.css";

const ArticleCard = ({ title, artist, url_imagen }) => {

    return (
        <div>
            <div className="card" style={{ width: '180px', border: 'none', marginRight: '35px', height: '230px' }}>
                <img style={{ width: '180px', height: '180px', objectFit: 'cover' }} src={url_imagen} className="card-img-top" alt="..." />
                <div className="card-body" style={{ padding: 0 }}>
                    <p className={`card-title ${styles.blueFont} ${styles.ArticleCardStyles}`}>
                        <strong>{title}</strong>
                    </p>
                    <p className={`card-text ${styles.blueFont} ${styles.ArticleCardStyles}`}>{artist}</p>
                </div>
            </div>
        </div >
    )
}

export default ArticleCard
