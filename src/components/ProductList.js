import React, { useState } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaBox } from 'react-icons/fa';

function ProductList({ products, onDeleteProduct, onAddVariant, onDeleteVariant }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantData, setVariantData] = useState({
    model: '',
    price: '',
    quantity: '',
    photo: ''
  });
  const [showVariants, setShowVariants] = useState({});

  const handleAddVariant = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setVariantData({ model: '', price: '', quantity: '', photo: '' });
    setShowModal(true);
  };

  const handleSaveVariant = () => {
    if (selectedProduct) {
      onAddVariant(
        selectedProduct.id,
        variantData.model,
        variantData.price,
        variantData.quantity,
        variantData.photo
      );
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  const toggleVariants = (productId) => {
    setShowVariants(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const totalQuantity = (variants) => {
    return variants.reduce((sum, v) => sum + v.quantity, 0);
  };

  return (
    <div>
      {products.length === 0 ? (
        <Alert variant="info">Нет товаров. Добавьте первый товар!</Alert>
      ) : (
        products.map(product => (
          <Card key={product.id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{product.name}</strong>
                <Badge bg="secondary" className="ms-2">
                  {product.variants.length} фасонов
                </Badge>
                <Badge bg="info" className="ms-2">
                  Всего: {totalQuantity(product.variants)} шт.
                </Badge>
              </div>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => toggleVariants(product.id)}
                >
                  <FaBox /> {showVariants[product.id] ? 'Скрыть' : 'Показать'} фасоны
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleAddVariant(product.id)}
                >
                  <FaPlus /> Добавить фасон
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onDeleteProduct(product.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">{product.description}</p>
              
              {showVariants[product.id] && product.variants.length > 0 && (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Фасон</th>
                      <th>Цена ($)</th>
                      <th>Количество</th>
                      <th>Фото</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map(variant => (
                      <tr key={variant.id}>
                        <td>{variant.model}</td>
                        <td>{variant.price}</td>
                        <td>{variant.quantity}</td>
                        <td>
                          {variant.photo ? (
                            <img src={variant.photo} alt="фото" style={{ width: 50, height: 50 }} />
                          ) : (
                            'Нет фото'
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => onDeleteVariant(product.id, variant.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {showVariants[product.id] && product.variants.length === 0 && (
                <Alert variant="warning">Нет фасонов. Добавьте первый фасон!</Alert>
              )}
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить фасон для {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название фасона</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название фасона"
                value={variantData.model}
                onChange={(e) => setVariantData({...variantData, model: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                placeholder="Введите цену"
                value={variantData.price}
                onChange={(e) => setVariantData({...variantData, price: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Количество</Form.Label>
              <Form.Control
                type="number"
                placeholder="Введите количество"
                value={variantData.quantity}
                onChange={(e) => setVariantData({...variantData, quantity: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ссылка на фото (опционально)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите URL фото"
                value={variantData.photo}
                onChange={(e) => setVariantData({...variantData, photo: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveVariant}>
            Сохранить фасон
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProductList;