import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

function AddProductForm({ onAddProduct }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onAddProduct(name, description);
      setName('');
      setDescription('');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Название товара</Form.Label>
        <Form.Control
          type="text"
          placeholder="Введите название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Описание</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Введите описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Form.Group>
      
      <Button variant="primary" type="submit" className="w-100">
        Добавить товар
      </Button>
    </Form>
  );
}

export default AddProductForm;