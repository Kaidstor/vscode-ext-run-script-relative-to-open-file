#!/bin/bash

set -e

# Проверяем, что jq установлен
if ! command -v jq &> /dev/null; then
  echo "Ошибка: jq не установлен. Установите его и повторите попытку."
  exit 1
fi

# Выполняем сборку
echo "Сборка пакета..."
pnpm run package

# Извлекаем имя и версию из package.json
PACKAGE_PUBLISHER=$(jq -r '.publisher // "undefined_publisher"' package.json)
PACKAGE_NAME=$(jq -r '.name' package.json)
PACKAGE_VERSION=$(jq -r '.version' package.json)

# Удаляем старую версию расширения
EXT_DIR=~/.vscode/extensions/${PACKAGE_PUBLISHER}.${PACKAGE_NAME}-${PACKAGE_VERSION}
if [ -d "$EXT_DIR" ]; then
  echo "Удаляем старую версию расширения ${PACKAGE_PUBLISHER}.${PACKAGE_NAME}-${PACKAGE_VERSION}..."
  rm -rf "$EXT_DIR"
fi

# Обновляем версию в package.json
echo "Обновляем версию в package.json..."
npm version patch

# Извлекаем новую версию
NEW_PACKAGE_VERSION=$(jq -r '.version' package.json)

# Создаем директорию для нового расширения
NEW_EXT_DIR=~/.vscode/extensions/${PACKAGE_PUBLISHER}.${PACKAGE_NAME}-${NEW_PACKAGE_VERSION}
echo "Создаем директорию ${NEW_EXT_DIR}..."
mkdir -p "$NEW_EXT_DIR"

# Копируем необходимые файлы
echo "Копируем файлы в ${NEW_EXT_DIR}..."
cp -r dist package.json README.md "$NEW_EXT_DIR"

echo "Успешно установлено расширение ${PACKAGE_PUBLISHER}.${PACKAGE_NAME}-${NEW_PACKAGE_VERSION}!"