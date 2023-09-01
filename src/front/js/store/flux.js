const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			isLoggedIn: false,
			inbox: [],
			sent_messages: [],
			deleted_messages: [],
			searchResults: [],
			articleInReview: {},

			explorer_articles: [],
			filtered_explorer_articles: [],
			on_filtered_or_explorer: true,
			currentOffers: [],
			cart: []
		},
		actions: {
			registerNewUser: async (newUser) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/users/signup";
					const response = await fetch(backendUrl, {
						method: "POST",
						body: JSON.stringify(newUser),
						headers: {
							"Content-Type": "application/json"
						}
					});

					if (response.ok) {
						return true;
					} else {
						const errorResponse = await response.json();
						throw new Error(errorResponse.message); // Throw an error with the server's error message
					}

				} catch (error) {
					console.error("Error adding contact:", error);
					throw error;
				}
			},

			login: async ({ username_or_email, password }) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/users/login";
					const response = await fetch(backendUrl, {
						method: 'POST',
						body: JSON.stringify({ username_or_email, password }),
						headers: {
							"Content-Type": "application/json"
						}
					});

					const responseData = await response.json(); // Leer el cuerpo de la respuesta solo una vez

					if (!response.ok) {
						throw new Error(responseData.error || "Usuario o contraseña incorrecta");
					}

					const token = responseData.access_token;
					const userID = responseData.user_id;
					const auth = responseData.is_admin;
					localStorage.setItem('token', token);
					localStorage.setItem('userID', userID);
					localStorage.setItem('Auth', auth);

					const { checkAuthentication } = getActions();
					await checkAuthentication();

					return responseData;

				} catch (error) {
					throw new Error("Error al iniciar sesión. Por favor revise sus credenciales e intente de nuevo");
				}
			},

			checkAuthentication: async () => {
				try {
					const token = localStorage.getItem('token');
					if (token) {
						setStore({ isLoggedIn: true });
					} else {
						setStore({ isLoggedIn: false });
					}
					return token;
				} catch (error) {
					throw new Error("Error al verificar la autenticación");
				}
			},

			changePassword: async ({ currentPassword, newPassword }) => {
				try {
					const token = localStorage.getItem('token');
					const backendUrl = process.env.BACKEND_URL + "/api/users/update-password";
					const response = await fetch(backendUrl, {
						method: 'POST',
						body: JSON.stringify({ old_password: currentPassword, new_password: newPassword }),
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});

					const responseData = await response.json();
					return responseData;

				} catch (error) {
					throw new Error("Error al cambiar la contraseña. Por favor inténtalo de nuevo");
				}
			},

			logout: () => {
				localStorage.removeItem('token');
				localStorage.removeItem('userID');
				localStorage.removeItem('auth');
				setStore({ isLoggedIn: false });
			},

			getUserById: async (userId) => {
				try {
					const token = localStorage.getItem('token');
					const backendUrl = process.env.BACKEND_URL + `/api/users/profile/${userId}`;
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${token}`
						}
					});
					const userData = await response.json();
					return userData;
				} catch (error) {
					throw new Error("Error al obtener información del usuario. Por favor, inténtelo de nuevo más tarde.");
				}
			},

			editUser: async (userId, userData) => {
				const token = localStorage.getItem('token');
				const backendUrl = process.env.BACKEND_URL + "/api/users/edit_user/";

				try {
					const response = await fetch(`${backendUrl}${userId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(userData),
					});
					if (!response.ok) {
						const responseData = await response.json();
						throw new Error(responseData.error || "Error al editar el usuario");
					}
					const responseData = await response.json();
					return responseData
				} catch (error) {
					throw new Error("Error al editar el usuario. Por favor, inténtelo de nuevo más tarde.");
				}
			},

			getAllUsersInfo: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/users/all_users";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				try {
					if (!response.ok) {
						throw new Error("Error al obtener la lista de usuarios");
					}

					const data = await response.json();
					return data;
				} catch (error) {
					console.error("Error en getAllUsersInfo:", error.message);
					throw error;
				}
			},

			deleteUser: async (userId) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/users/delete_user/";
					const response = await fetch(`${backendUrl}${userId}`, {
						method: 'DELETE',
					});

					if (!response.ok) {
						throw new Error('Error al eliminar el usuario');
					}

					const data = await response.json();
					return data;
				} catch (error) {
					console.error('Error en deleteUser:', error.message);
					throw error;
				}
			},

			getAllMessages: async (userId) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages/" + userId;
					const response = await fetch(backendUrl)

					if (!response.ok) {
						throw new Error('Response error')
					}
					const data = await response.json()
					return data;
				} catch (error) {
					console.log('Error charging messages: ', error)
					return [];
				}
			},

			sendMessage: async (senderID, message_data) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages/sent/" + senderID;
					const response = await fetch(backendUrl, {
						method: 'POST',
						body: JSON.stringify(message_data),
						headers: {
							"Content-Type": "application/json"
						}
					})
					if (!response.ok) {
						console.log('Response error', response.status)
					}
					const data = await response.json()
					return data;
				} catch (error) {
					console.log('Error sending message: ', error)
				}
			},

			deleteMessage: async (selectedItems) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages/trash";
						const response = await fetch(backendUrl, {
							method: 'POST',
							body: JSON.stringify({ message_ids: selectedItems }),
							headers: {
								"Content-Type": "application/json"
							}
						});

						if (!response.ok) {
							console.log('Response error:', response.status);
						}
						const data = await response.json();
						return data
				} catch (error) {
					console.log('Error deleting messages:', error);
				}
			},

			recoverDeletedMessages: async (selectedItems) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages";
						const response = await fetch(backendUrl, {
							method: 'POST',
							body: JSON.stringify({ message_ids: selectedItems }),
							headers: {
								"Content-Type": "application/json"
							}
						});

						if (!response.ok) {
							console.log('Response error:', response.status);
						}
						const data = await response.json();
						return data
				} catch (error) {
					console.log('Error recovering messages:', error);
				}
			},

			deleteSentMessages: async (selectedItems) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages/sent";
						const response = await fetch(backendUrl, {
							method: 'DELETE',
							body: JSON.stringify({ message_ids: selectedItems }),
							headers: {
								"Content-Type": "application/json"
							}
						});

						if (!response.ok) {
							console.log('Response error:', response.status);
						}
						const data = await response.json();
						return data
				} catch (error) {
					console.log('Error deleting messages:', error);
				}
			},

			deleteTrashMessages: async (selectedItems) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/inbox_user/messages/trash";
						const response = await fetch(backendUrl, {
							method: 'DELETE',
							body: JSON.stringify({ message_ids: selectedItems }),
							headers: {
								"Content-Type": "application/json"
							}
						});

						if (!response.ok) {
							console.log('Response error:', response.status);
						}
						const data = await response.json();
						return data
				} catch (error) {
					console.log('Error deleting messages:', error);
				}
			},

			createArtist: async (artist) => {
				const backendUrl = process.env.BACKEND_URL + "/api/artists/create";
				const response = await fetch(backendUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(artist)
				});

				if (!response.ok)
					throw new Error("Error al intentar guardar Artista");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},

			getAllArticles: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/articles/";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artículos");

				const data = await response.json();
				const store = getStore()
				setStore({
					...store,
					explorer_articles: data,
					on_filtered_or_explorer: true
				})
				if (response.status == 400) {
					throw new Error(data.message);
				}
				return data;
			},
			getAllArticlesGroupedByGenre: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/articles/get_all_grouped_by_genre/";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artículos");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},

			getAllArticlesByGenre: async (genre) => {
				const backendUrl = process.env.BACKEND_URL + "/api/articles/genre/" + genre;
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artículos");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},
			addArticleForApproval: async (article, file) => {
				const backendUrl = process.env.BACKEND_URL + "/api/approvals/add";

				const formData = new FormData();
				formData.append("article", JSON.stringify(article));
				if (file)
					formData.append("file", file);

				const response = await fetch(backendUrl, {
					method: "POST",
					body: formData
				});

				return response;
			},
			rejectArticle: async (article) => {
				const backendUrl = process.env.BACKEND_URL + "/api/approvals/reject";
				const response = await fetch(backendUrl, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(article)
				});

				if (!response.ok) {
					throw new Error('Error on adding Article response');
				}

				const data = await response.json();

				return data;
			},


			getArticleForApproval: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/approvals/";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artículos");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},
			addApprovedArticle: async (newArticle) => {
				const backendUrl = process.env.BACKEND_URL + "/api/articles/add";
				const response = await fetch(backendUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(newArticle)
				});

				if (!response.ok) {
					throw new Error('Error on adding Article response');
				}

				const data = await response.json();

				return data;
			},

			deleteApprovedArticle: async (newArticle) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/approvals/";
					const response = await fetch(backendUrl, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(newArticle)
					});

					if (!response.ok) {
						throw new Error('Error on adding Article response');
					}
					const data = await response.json();
					return data;
				} catch (error) {
					console.error('Error posting Article:', error);
					throw error;
				}
			},


			getAllArtists: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/artists/";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artistas");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},
			getAllArtistsLikeName: async (inputValue) => {
				const backendUrl = process.env.BACKEND_URL + "/api/artists/" + inputValue;
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Artistas");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},
			expandedSearch: async (searchContent) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/searchbar/search/" + searchContent;
					const response = await fetch(backendUrl)
					if (!response.ok)
						throw new Error("Error on searching response");

					const data = await response.json();
					const store = getStore()
					setStore({ ...store, filtered_explorer_articles: [] })
					setStore({
						...store,
						filtered_explorer_articles: data.articles,
						on_filtered_or_explorer: false
					})

				} catch (error) {
					console.log('Error in searching', error)
				}
			},
			search: async (term) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/articles/search/" + (term ? term : "");
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							"Content-Type": "application/json"
						}
					});

					if (!response.ok)
						throw new Error("Error al intentar buscar");

					const data = await response.json();
					let store = getStore();
					setStore({ ...store, searchResults: data });
				} catch (error) {
					console.log("Error fatal: ", error);
				}
			},
			getGenres: async () => {
				const backendUrl = process.env.BACKEND_URL + "/api/articles/genres/";
				const response = await fetch(backendUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok)
					throw new Error("Error al intentar obtener Generos");

				const data = await response.json();

				if (response.status == 400) {
					throw new Error(data.message);
				}

				return data;
			},

			adminMessages: async (user_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/inbox_admin/messages/${user_id}`;

					const response = await fetch(backendUrl)
					if (!response.ok) {
						throw new Error('Response error')
					}
					const data = await response.json()
				} catch (error) {
					console.log('Error charging messages: ', error)
				}
			},

			adminMessagesArchived: async (user_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/messages/archive/${user_id}`;
					const response = await fetch(backendUrl)
					if (!response.ok) {
						throw new Error('Response error')
					}
					const data = await response.json()
				} catch (error) {
					console.log('Error getting archived messages: ', error)
				}
			},
			postOffer: async (offer) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/offers/post";
					const response = await fetch(backendUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(offer)
					});
					if (!response.ok) {
						throw new Error('Error on adding offer response')
					}
					const data = await response.json()
				} catch (error) {
					console.log('Error posting offer:', error)
				}
			},

			getOffers: async () => {
				try {
					const article = JSON.parse(localStorage.getItem('currentArticle'));
					const backendUrl = process.env.BACKEND_URL + `/api/offers/${article.id}`;
					const response = await fetch(backendUrl)
					if (!response.ok) {
						throw new Error('Error on getting offers response')
					}
					const data = await response.json()
					const store = getStore()
					setStore({ ...store, currentOffers: data })
				} catch (error) {
					console.log('Error getting offers:', error)
				}
			},

			getUserOffers: async (user_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/offers/seller/${user_id}`;
					const response = await fetch(backendUrl)
					if (!response.ok) {
						throw new Error('Error on getting offers response')
					}
					const data = await response.json()
					return data
				} catch (error) {
					console.log('Error getting offers:', error)
				}
			},

			newCartElement: async (new_element) => {
				try {
					const backendUrl = process.env.BACKEND_URL + "/api/cart/add";
					const response = await fetch(backendUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(new_element)
					});
					if (!response.ok) {
						throw new Error('Error on response')
					}
					const data = await response.json()
					return data
				} catch (error) {
					console.log('Error on adding cart element', error)
				}
			},

			getCart: async () => {
				try {
					const user_id = localStorage.getItem('userID');
					const backendUrl = process.env.BACKEND_URL + `/api/cart/${user_id}`;
					const response = await fetch(backendUrl, {
						method: "GET",
						headers: {
							"Content-Type": "application/json"
						}
					});
					if (!response.ok) {
						throw new Error('Error on getting offers response')
					}
					const data = await response.json()
					const store = getStore()
					setStore({ ...store, cart: data })
				} catch (error) {
					console.log('Error getting cart:', error)
				}
			},

			deleteCartItem: async (cart_element) => {
				try {
					const store = getStore()
					let variable = null
					const updatedCart = store.cart.map(cartItem => {
						if (cartItem.seller.id === cart_element.vendedor_id) {
							const updatedOffers = cartItem.offers.filter(offer => offer.oferta_id !== cart_element.oferta_id);
							if (updatedOffers.length === 0) {
								const { deleteCartItemsBySeller } = getActions()
								const object = {
									'user_id': cart_element.user_id,
									'vendedor_id': cartItem.seller.id
								}
								deleteCartItemsBySeller(object)
								variable = 0
							} else {
								return { ...cartItem, offers: updatedOffers };
							}
						}
						return cartItem;
					});
					setStore(prevStore => ({
						...prevStore,
						cart: updatedCart
					}));
					if (variable === 0) {
						return
					}
					const backendUrl = process.env.BACKEND_URL + '/api/cart/delete_item';
					const response = await fetch(backendUrl, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(cart_element)
					});
					if (!response.ok) {
						throw new Error('Error on deleting cart element response')
					}
					const data = await response.json()
				} catch (error) {
					console.log('Error deleting cart article:', error)
				}
			},

			deleteCartItemsBySeller: async (cart_element) => {
				try {
					const store = getStore()
					const updatedCart = store.cart.filter(cartItem => cartItem.seller.id !== cart_element.vendedor_id);
					setStore({ ...store, cart: updatedCart })
					const backendUrl = process.env.BACKEND_URL + '/api/cart/delete_by_seller';
					const response = await fetch(backendUrl, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(cart_element)
					});
					if (!response.ok) {
						throw new Error('Error on deleting cart by seller response')
					}
					const data = await response.json()
				} catch (error) {
					console.log('Error deleting cart articles by seller:', error)
				}
			},

			addFavorites: async ({ user_id, articulo_id }) => {
				try {
					const article = {
						article_id: articulo_id
					};
					const backendUrl = process.env.BACKEND_URL + `/api/favorites/${user_id}`;
					const response = await fetch(backendUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(article),
					});

					if (!response.ok) {
						if (response.status === 409) {
							const errorData = await response.json();
							throw new Error(errorData.message || 'El articulo ya esta agregado a Favoritos');
						} else {
							const errorData = await response.json();
							throw new Error(errorData.message || 'Failed to add favorite');
						}
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error adding favorite:', error);
					throw error;
				}
			},

			getFavoritesByUserId: async (user_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/favorites/${user_id}`;
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to fetch favorites');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error fetching favorites:', error);
					throw error;
				}
			},

			deleteFavorite: async (user_id, article_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/favorites/${user_id}/favorites/${article_id}`;
					const response = await fetch(backendUrl, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to delete favorite');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error deleting favorite:', error);
					throw error;
				}
			},

			editSeller: async (seller_info) => {
				try {
					const user_id = localStorage.getItem('userID');
					const token = localStorage.getItem('token');
					const backendUrl = process.env.BACKEND_URL + `/api/users/seller/${user_id}`;
					const response = await fetch(backendUrl, {
						method: "PUT",
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(seller_info),
					});
					if (!response.ok) {
						throw new Error('Error on edditing seller response')
					}
					const data = await response.json()
					return (data)
				} catch (error) {
					console.log('Error editing seller info', error)
				}
			},

			createOrder: async ({ usuario_id, articles_ids, ofertas_ids, precio_envio, subtotal, impuesto, condicion_funda, condicion_soporte, vendedor_id, pagado }) => {
				try {
					const requestData = {
						usuario_id: usuario_id,
						articles_ids: articles_ids,
						ofertas_ids: ofertas_ids,
						precio_envio: precio_envio,
						subtotal: subtotal,
						impuesto: impuesto,
						condicion_funda: condicion_funda,
						condicion_soporte: condicion_soporte,
						vendedor_id: vendedor_id,
						pagado: pagado
					};
					const backendUrl = process.env.BACKEND_URL + `/api/orders/`;
					const response = await fetch(backendUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(requestData),
					});

					if (!response.ok) {
						const errorData = await response.json();
						const errorMessage = errorData.message || 'Failed to add order';
						console.error('Error adding order:', errorMessage, errorData);
						throw new Error(errorMessage);
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error adding order:', error);
					throw error;
				}
			},

			getOrderPlaced: async (user_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/orders/${user_id}`;
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});
					if (!response.ok) {
						throw new Error('Unable to get orders information.');
					}
					const data = await response.json();

					const orders = data.pedidos;
					return orders;

				} catch (error) {
					console.error('Error getting the orders:', error);
					throw error;
				}
			},

			getOrderById: async (order_id) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/orders/order/${order_id}`;
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						throw new Error('Unable to get order information.');
					}

					const data = await response.json();
					const order = data;

					return order;

				} catch (error) {
					console.error('Error getting the order:', error);
					throw error;
				}
			},

			sendShippingCost: async (object) => {
				try {
					const backendUrl = process.env.BACKEND_URL + '/api/orders/order';
					const response = await fetch(backendUrl, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(object),
					});

					if (!response.ok) {
						throw new Error('Unable to set order shipping.');
					}

					const data = await response.json();
					const order = data;
					return order;
				} catch (error) {
					console.error('Error setting order shipping:', error);
					throw error;
				}
			},

			getCuriosities: async () => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/home/`;
					const response = await fetch(backendUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						throw new Error('Error on getting curiosities fetch');
					}
					const data = await response.json();
					return data;
				} catch (error) {
					console.error('Error getting curiosities:', error);
				}
			},

			setArticleToApprove: (articleInReview) => {
				let store = getStore();
				setStore({ ...store, articleInReview: articleInReview });
			},

			deleteOrderbyOrderId: async ({ user_id, order_id }) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/orders/${user_id}/${order_id}`;
					const response = await fetch(backendUrl, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to delete order');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error deleting order', error);
					throw error;
				}
			},

			updatePaymentStatus: async ({ orderID, nuevo_estado_pagado }) => {
				try {
					const backendUrl = `${process.env.BACKEND_URL}/api/orders/${orderID}`;
					const response = await fetch(backendUrl, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ pagado: nuevo_estado_pagado }),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to update payment status');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error updating payment status', error);
					throw error;
				}
			},

			addCuriositie: async (formData) => {
				const backendUrl = process.env.BACKEND_URL + "/api/home/edit";
				const response = await fetch(backendUrl, {
					method: "PUT",
					body: formData
				});
				const data = await response.json()
				return data;
			},

			forgotPassword: async (email) => {
				try {
					const backendUrl = process.env.BACKEND_URL + 'api/users/reset_password_request';
					const response = await fetch(backendUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: email,
						}),
					});

					if (response.ok) {
						const responseData = await response.json();
						return responseData;
					} else {
						console.error('Error en la solicitud de restablecimiento de contraseña:', response.status);
					}

				} catch (error) {
					// Error de red u otro error, puedes manejarlo aquí
					console.error('Error al enviar la solicitud de restablecimiento de contraseña:', error.message);
				}
			},

			sendRating: async (object) => {
				try {
					const backendUrl = `${process.env.BACKEND_URL}/api/orders/upload_rating`;
					const response = await fetch(backendUrl, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(object),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to update rating');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error('Error updating rating', error);
					throw error;
				}
			},

			deleteOffer: async (ofertas_ids) => {
				try {
					const backendUrl = process.env.BACKEND_URL + `/api/offers/delete`;
					const response = await fetch(backendUrl, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({"ofertas_ids": ofertas_ids})
					});

					if (!response.ok) {
						throw new Error('Failed to delete offer');
					}

					const data = await response.json()
					return data
				} catch (error) {
					console.error('Error deleting offer', error);
					throw error;
				}
			},
		}
	};
};

export default getState;
