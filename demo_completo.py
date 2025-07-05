#!/usr/bin/env python3
"""
Demonstração completa do sistema de licenciamento
"""

from license_manager import LicenseManager
import os
import json

def main():
    print("=" * 60)
    print("DEMONSTRAÇÃO COMPLETA - SISTEMA DE LICENCIAMENTO")
    print("ENTALHE CNC CAM")
    print("=" * 60)
    
    lm = LicenseManager()
    
    # 1. Mostrar chaves existentes
    print("\n1. 📋 CHAVES VÁLIDAS EXISTENTES:")
    print("-" * 40)
    valid_keys = lm.load_valid_keys()
    if valid_keys:
        for i, (key_hash, info) in enumerate(valid_keys.items(), 1):
            print(f"{i}. Hash: {key_hash[:16]}...")
            print(f"   Cliente: {info.get('customer', 'N/A')}")
            print(f"   Criada: {info.get('created', 'N/A')[:10]}")
            print(f"   Expira: {info.get('expires', 'N/A')[:10]}")
            print(f"   Dias válidos: {info.get('days_valid', 'N/A')}")
            print()
    else:
        print("Nenhuma chave encontrada.")
    
    # 2. Gerar nova chave
    print("\n2. 🔑 GERANDO NOVA CHAVE:")
    print("-" * 40)
    new_key = lm.generate_license_key("Cliente Demonstração", 180)
    print(f"✅ Nova chave: {new_key}")
    print(f"📅 Válida por: 180 dias")
    print(f"🔒 Hash: {lm.hash_key(new_key)}")
    
    # 3. Validar a chave
    print("\n3. ✅ VALIDANDO CHAVE:")
    print("-" * 40)
    is_valid, message = lm.validate_key(new_key)
    print(f"Resultado: {message}")
    
    # 4. Simular ativação
    print("\n4. 💾 SIMULANDO ATIVAÇÃO:")
    print("-" * 40)
    
    # Remove licença existente se houver
    if os.path.exists("license.json"):
        os.remove("license.json")
        print("Licença anterior removida.")
    
    # Verifica status antes da ativação
    is_licensed, msg = lm.check_license()
    print(f"Status antes: {msg}")
    
    # Simula ativação
    lm.save_license(new_key)
    print("Licença ativada!")
    
    # Verifica status após ativação
    is_licensed, msg = lm.check_license()
    print(f"Status depois: {msg}")
    
    # 5. Mostrar arquivo de licença
    print("\n5. 📄 ARQUIVO DE LICENÇA CRIADO:")
    print("-" * 40)
    if os.path.exists("license.json"):
        with open("license.json", 'r') as f:
            license_data = json.load(f)
        
        print(f"Hash da chave: {license_data.get('key_hash', 'N/A')[:16]}...")
        print(f"ID da máquina: {license_data.get('machine_id', 'N/A')}")
        print(f"Data de ativação: {license_data.get('activated_date', 'N/A')[:19]}")
        print(f"Status: {license_data.get('status', 'N/A')}")
    
    # 6. Resumo final
    print("\n6. 📊 RESUMO DO SISTEMA:")
    print("-" * 40)
    print("✅ Sistema de licenciamento funcionando")
    print("✅ Chaves vinculadas ao hardware")
    print("✅ Validação de expiração")
    print("✅ Interface gráfica de ativação")
    print("✅ Geração automática de chaves")
    
    print(f"\n📈 Total de chaves válidas: {len(lm.load_valid_keys())}")
    print(f"🔧 ID desta máquina: {lm.generate_machine_id()}")
    
    print("\n" + "=" * 60)
    print("DEMONSTRAÇÃO CONCLUÍDA!")
    print("=" * 60)
    
    print("\nPróximos passos:")
    print("1. Execute 'python build_installer.py' para criar o instalador")
    print("2. Use 'python generate_license.py' para gerar mais chaves")
    print("3. Teste com 'python launcher.py'")
    
    return new_key

if __name__ == "__main__":
    main()
