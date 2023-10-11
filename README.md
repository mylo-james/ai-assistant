# AI Assistant

Welcome to the AI Assistant repository! This budding project begins its journey by offering a refreshing morning brief to kickstart your day. Powered by OpenAI, it merges weather forecasts, your daily agenda, and a dash of inspiration into a friendly, concise narrative. But that's just the tip of the iceberg! The vision is to evolve into a versatile companion catering to various daily digital needs. 🚀

## Getting Started

Here’s how to get AI Assistant up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- An OpenAI API key
- A weather API key from [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/mylo-james/ai-assistant.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ai-assistant
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Ensure you have the necessary `.txt` files (`systemText.txt`, `aboutMe.txt`, and `yesterday.txt`) in your project root.
2. Run the server:
   ```bash
   npm start
   ```
3. Access the endpoint `http://localhost:6135` in your browser or through a tool like Postman, passing any events for the day as query parameters.

### Extending Functionality

- The modular structure allows for easy addition of new features. Explore, expand, and tailor the AI Assistant to meet a plethora of digital needs.

## Configuration

- Update `systemText.txt`, `aboutMe.txt`, and `yesterday.txt` to tailor the assistant's responses.
- Configure the OpenAI and weather API keys in a `.env` file.

## Contributing

Join in on crafting a multifaceted AI companion! Fork the repository, create a new branch, and submit a pull request to propose your majestic enhancements.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Contact

Mylo James - mylo.james114@gmail.com

---

Feel free to make any further tweaks to better align with your project's vision or requirements!
