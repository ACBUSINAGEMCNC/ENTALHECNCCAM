#!/usr/bin/env python3
"""
Script para criar uma chave de teste
"""

from license_manager import LicenseManager

def main():
    print("Criando chave de teste...")
    
    lm = LicenseManager()
    
    # Gera uma chave de teste válida por 30 dias
    test_key = lm.generate_license_key("Cliente Teste", 30)
    
    print(f"✅ Chave de teste criada: {test_key}")
    print(f"Válida por: 30 dias")
    print(f"Hash: {lm.hash_key(test_key)}")
    
    # Testa a validação
    is_valid, message = lm.validate_key(test_key)
    print(f"Validação: {message}")
    
    return test_key

if __name__ == "__main__":
    main()
