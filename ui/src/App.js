import React, { Component } from 'react';
import './App.css';
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      formData: {
        title: '',
        review: ''
      },
      result: ""
    };
  }

  handleGameChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData
    });

    fetch('http://localhost:5000/query/', 
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        method: 'POST',
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(response => {
        this.setState({
          result: response.result
        });
      });
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData
    });
  }

  handlePredictClick = (event) => {
    const formData = this.state.formData;
    this.setState({ isLoading: true });
    fetch('http://localhost:5000/prediction/', 
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        method: 'POST',
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(response => {
        this.setState({
          result: response.result,
          isLoading: false
        });
      });
  }

  handleCancelClick = (event) => {
    this.setState({ result: "" });
  }

  render() {
    const isLoading = this.state.isLoading;
    const formData = this.state.formData;
    const result = this.state.result;
    
    var products = []
    products.push(<option key = "1" value = "1">Baldur's Gate III</option>);
    products.push(<option key = "2" value = "2">Spelunk 2</option>);
    products.push(<option key = "3" value = "3">Crusader Kings III</option>);

    return (
      <Container>
        <div className="title">
          <Row>
            <Col md={4}>
              <Image src="https://easy-sparc.github.io/images/entremares/conceito.png" fluid/>
            </Col>
            <Col>
              <h1>The Reviewer</h1>
              <p>
                  Game reviews where recomendation and helpfulness are automatically extracted using only the text.
              </p>
            </Col>
          </Row>
        </div>
        <div className="content">
          <Form>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Control 
                  as="select"
                  value={formData.title}
                  name="title"
                  onChange={this.handleGameChange}>
                  {products}
                </Form.Control>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Control
                  as="textarea"
                  rows="3"
                  type="text" 
                  placeholder="Insert the review" 
                  name="review"
                  value={formData.review}
                  onChange={this.handleChange} />
              </Form.Group>
            </Form.Row>
            <Row>
              <Col>
                <Button
                  block
                  variant="success"
                  disabled={isLoading}
                  onClick={!isLoading ? this.handlePredictClick : null}>
                  { isLoading ? 'Computing...' : 'Send' }
                </Button>
              </Col>
            </Row>
          </Form>
          {result === "" ? null :
            (<Row>
              <Col className="result-container">
                <h5 id="result">{result}</h5>
              </Col>
            </Row>)
          }
        </div>
      </Container>
    );
  }
}

export default App;
