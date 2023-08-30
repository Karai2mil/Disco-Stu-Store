import React, { useContext, useState } from 'react'
import { Context } from '../store/appContext';
import "../../styles/searchbar.css";
import { setNestedObjectValues } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';


const SearchBar = () => {
	const { actions } = useContext(Context);
	const [term, setTerm] = useState('');
	const location = useLocation();
	const navigate = useNavigate();
	let timeout;

	const searchContent = async (e) => {
		const term = e.target.value;
		setTerm(term);

		const isExplorerView = location.pathname === '/explorer';
		if(!isExplorerView)
			navigate('/explorer');

		if (e.key === 'Backspace') {
			return;
		}

		clearTimeout(timeout);

		if (term.length > 2 || term === "" || e.key === 'Enter') {
			timeout = setTimeout(async () => {
				await actions.search(term);
				setTerm("");
			}, 700);
		}
	};

	return (
		<div>
			<div className="input-group">
				<input
					id="search-input"
					className={`search-click border-start-0`}
					type="search"
					placeholder="Buscar artistas, álbumes y otros..."
					aria-label="Search"
					onInput={(e) => searchContent(e)}
					onKeyDown={(e) => searchContent(e)}
					onChange={() => {}}
					value={term}
				/>
			</div>
		</div>
	)
}


export default SearchBar