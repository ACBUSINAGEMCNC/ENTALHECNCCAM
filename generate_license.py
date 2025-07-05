#!/usr/bin/env python3
"""
Script para gerar chaves de licença para o ENTALHE CNC CAM
Uso: python generate_license.py
"""

from license_manager import LicenseManager
import sys

def main():
    print("=== GERADOR DE CHAVES DE LICENÇA ===")
    print("ENTALHE CNC CAM")
    print("-" * 40)
    
    lm = LicenseManager()
    
    while True:
        print("\nOpções:")
        print("1. Gerar nova chave")
        print("2. Validar chave existente")
        print("3. Listar chaves válidas")
        print("4. Sair")
        
        choice = input("\nEscolha uma opção (1-4): ").strip()
        
        if choice == "1":
            # Gerar nova chave
            customer = input("Nome do cliente (opcional): ").strip()
            
            try:
                days_input = input("Dias de validade (padrão 365): ").strip()
                days = int(days_input) if days_input else 365
            except ValueError:
                days = 365
                print("Valor inválido, usando 365 dias.")
            
            key = lm.generate_license_key(customer, days)
            
            print(f"\n✅ CHAVE GERADA COM SUCESSO!")
            print(f"Chave: {key}")
            print(f"Cliente: {customer or 'N/A'}")
            print(f"Válida por: {days} dias")
            print(f"Hash: {lm.hash_key(key)}")
            
        elif choice == "2":
            # Validar chave
            key = input("Digite a chave para validar: ").strip()
            if key:
                is_valid, message = lm.validate_key(key)
                if is_valid:
                    print(f"✅ {message}")
                else:
                    print(f"❌ {message}")
            
        elif choice == "3":
            # Listar chaves válidas
            valid_keys = lm.load_valid_keys()
            if not valid_keys:
                print("Nenhuma chave encontrada.")
            else:
                print(f"\n📋 CHAVES VÁLIDAS ({len(valid_keys)} total):")
                print("-" * 80)
                for key_hash, info in valid_keys.items():
                    print(f"Hash: {key_hash[:16]}...")
                    print(f"Cliente: {info.get('customer', 'N/A')}")
                    print(f"Criada: {info.get('created', 'N/A')}")
                    print(f"Expira: {info.get('expires', 'N/A')}")
                    print("-" * 40)
        
        elif choice == "4":
            print("Saindo...")
            break
        
        else:
            print("Opção inválida!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperação cancelada pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\nErro: {e}")
        sys.exit(1)
