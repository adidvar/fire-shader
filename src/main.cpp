#include <SDL2/SDL.h>
#include <glad/glad.h>

#include <fstream>
#include <iostream>
#include <sstream>

const char* vertexShaderSource = R"(
#version 450 core
layout(location = 0) in vec3 aPos;

void main() {
    gl_Position = vec4(aPos, 1.0);
}
)";

std::string readFile(const std::string& filename) {
  std::ifstream file(filename);

  if (!file.is_open()) {
    std::cerr << "File opening error: " << filename << std::endl;
    return "";
  }

  std::stringstream buffer;
  buffer << file.rdbuf();

  file.close();

  return buffer.str();
}

void checkShaderCompileErrors(GLuint shader, const std::string& type) {
  GLint success;
  GLchar infoLog[1024];
  if (type == "PROGRAM") {
    glGetProgramiv(shader, GL_LINK_STATUS, &success);
    if (!success) {
      glGetProgramInfoLog(shader, 1024, NULL, infoLog);
      std::cerr << "ERROR::PROGRAM_LINKING_ERROR\n" << infoLog << std::endl;
    }
  } else {
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
      glGetShaderInfoLog(shader, 1024, NULL, infoLog);
      std::cerr << "ERROR::SHADER_COMPILATION_ERROR of type: " << type << "\n"
                << infoLog << std::endl;
    }
  }
}

int main(int argc, char* argv[]) {
  if (SDL_Init(SDL_INIT_VIDEO) != 0) {
    std::cerr << "Failed to initialize SDL: " << SDL_GetError() << std::endl;
    return -1;
  }

  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 5);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);

  int w_width = 800;
  int w_height = 800;

  SDL_Window* window = SDL_CreateWindow(
      "FireShader", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, w_width,
      w_height, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN);
  if (!window) {
    std::cerr << "Failed to create SDL window: " << SDL_GetError() << std::endl;
    SDL_Quit();
    return -1;
  }

  SDL_GLContext glContext = SDL_GL_CreateContext(window);
  if (!glContext) {
    std::cerr << "Failed to create OpenGL context: " << SDL_GetError()
              << std::endl;
    SDL_DestroyWindow(window);
    SDL_Quit();
    return -1;
  }

  if (SDL_GL_SetSwapInterval(1) != 0) {
    std::cerr << " VSync error: " << SDL_GetError() << std::endl;
  }

  if (!gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress)) {
    std::cerr << "Failed to initialize GLAD" << std::endl;
    SDL_GL_DeleteContext(glContext);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return -1;
  }

  std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;

  glViewport(0, 0, w_width, w_height);

  GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
  glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
  glCompileShader(vertexShader);
  checkShaderCompileErrors(vertexShader, "VERTEX");

  GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
  auto fragmentSource = readFile("fire.frag");
  const char* shaderSources[] = {fragmentSource.c_str()};
  glShaderSource(fragmentShader, 1, shaderSources, NULL);
  glCompileShader(fragmentShader);
  checkShaderCompileErrors(fragmentShader, "FRAGMENT");

  GLuint shaderProgram = glCreateProgram();
  glAttachShader(shaderProgram, vertexShader);
  glAttachShader(shaderProgram, fragmentShader);
  glLinkProgram(shaderProgram);
  checkShaderCompileErrors(shaderProgram, "PROGRAM");

  glDeleteShader(vertexShader);
  glDeleteShader(fragmentShader);

  float vertices[] = {-1.0f, -1.0f, 0.0f, -1.0f, 1.0f, 0.0f,
                      1.0f,  -1.0f, 0.0f, 1.0f,  1.0f, 0.0f,
                      1.0f,  -1.0f, 0.0f, -1.0f, 1.0f, 0.0f};

  GLuint VAO, VBO;
  glGenVertexArrays(1, &VAO);
  glGenBuffers(1, &VBO);

  glBindVertexArray(VAO);

  glBindBuffer(GL_ARRAY_BUFFER, VBO);
  glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

  glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
  glEnableVertexAttribArray(0);

  glBindBuffer(GL_ARRAY_BUFFER, 0);
  glBindVertexArray(0);

  GLint u_resolution = glGetUniformLocation(shaderProgram, "u_resolution");
  GLint u_mouse = glGetUniformLocation(shaderProgram, "u_mouse");
  GLint u_time = glGetUniformLocation(shaderProgram, "u_time");

  bool isRunning = true;
  SDL_Event event;

  while (isRunning) {
    while (SDL_PollEvent(&event)) {
      if (event.type == SDL_QUIT) {
        isRunning = false;
      }
    }

    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    glUseProgram(shaderProgram);

    glUniform2f(u_resolution, w_width, w_height);
    glUniform2f(u_mouse, 0, 0);
    glUniform1f(u_time, SDL_GetTicks64() / 1000.0);

    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 6);

    SDL_GL_SwapWindow(window);
  }

  glDeleteVertexArrays(1, &VAO);
  glDeleteBuffers(1, &VBO);
  glDeleteProgram(shaderProgram);

  SDL_GL_DeleteContext(glContext);
  SDL_DestroyWindow(window);
  SDL_Quit();

  return 0;
}
