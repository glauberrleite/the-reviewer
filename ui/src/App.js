import React, { Component } from 'react';
import './App.css';
import Image from 'react-bootstrap/Image'
import Card from 'react-bootstrap/Card'
import CardDeck from 'react-bootstrap/CardDeck'
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
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
      result: "",
      query: []
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
          query: response.result
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

  render_query(query) {
    console.log(query);
    let rows = [];

    for(let i = 0; i < query.length; i++) {
      let rv = query[i];
      let bg = ['danger', 'success'];

      rows.push(<Card 
        bg={bg[rv.recommendation]}
        text='white'
        style={{ width: '18rem' }}
        key={i}
        className="mb-2"
        >
          <Card.Header>
            {rv.recommendation === 1 ? (<OverlayTrigger key="top-rec" placement="top" overlay={<Tooltip id={'tooltip-top'}><strong>Recommended</strong></Tooltip>}><i className="fas fa-thumbs-up"></i></OverlayTrigger>) : (<OverlayTrigger key="top-rec" placement="top" overlay={<Tooltip id={'tooltip-top'}><strong>Not Recommended</strong></Tooltip>}><i className="fas fa-thumbs-down"></i></OverlayTrigger>)}
            &nbsp;&nbsp;{rv.funny === 1 ? (<OverlayTrigger key="top-funny" placement="top" overlay={<Tooltip id={'tooltip-top'}><strong>Funny</strong></Tooltip>}><i className="fas fa-grin-tears"></i></OverlayTrigger>) : ""}
            &nbsp;&nbsp;{rv.helpful === 1 ? (<OverlayTrigger key="top-helpful" placement="top" overlay={<Tooltip id={'tooltip-top'}><strong>Helpful</strong></Tooltip>}><i className="fas fa-info"></i></OverlayTrigger>) : ""}</Card.Header>
          <Card.Body>
            <Card.Text>{rv.review}</Card.Text>
          </Card.Body>
        </Card>);
      
    }
    return rows;
  }

  render() {
    const isLoading = this.state.isLoading;
    const formData = this.state.formData;
    const result = this.state.result;
    const query = this.state.query;
    
    var products = []
    products.push(<option key = "1" value = "Baldur's Gate III">Baldur's Gate III</option>);
    products.push(<option key = "2" value = "Spelunk 2">Spelunk 2</option>);
    products.push(<option key = "3" value = "Crusader Kings III">Crusader Kings III</option>);

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
        <div className="content">
          <CardDeck>
          {query.length === 0 ? 
            (<Card body>There are no reviews for this game.</Card>) :
            this.render_query(query)
          }
          </CardDeck>
        </div>
      </Container>
    );
  }
}

export default App;
