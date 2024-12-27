cmake_minimum_required(VERSION 3.30)
project(fireshader)

add_subdirectory(glad)

find_package(SDL2_image)
find_package(SDL2)

add_executable(fireshader src/main.cpp)
target_link_libraries(fireshader  SDL2_image::SDL2_image SDL2::SDL2main glad)

add_custom_target(shaders ALL
  COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/shaders/fire.frag" ${CMAKE_BINARY_DIR}
  COMMENT "Copying shaders to the output directory..."
  DEPENDS "${CMAKE_SOURCE_DIR}/shaders/fire.frag"
  SOURCES "${CMAKE_SOURCE_DIR}/shaders/fire.frag"
)

add_dependencies(fireshader shaders)
