import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useCep } from "@/hooks/useCep";
import type { AddressDetail } from "@/types";
import styles from "./AddressForm.module.css";

export const EMPTY_ADDRESS: AddressDetail = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
};

interface AddressFormProps {
  address: AddressDetail;
  onChange: (address: AddressDetail) => void;
  addressError?: string | null;
  onClearError?: () => void;
}

export function AddressForm({
  address,
  onChange,
  addressError,
  onClearError,
}: AddressFormProps) {
  const { loading: cepLoading, error: cepError, fetchCep } = useCep();

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    onChange({ ...address, zipCode: digits });

    if (digits.length === 8) {
      const result = await fetchCep(digits);
      if (result) {
        // useCep retorna result.street / .neighborhood / .city / .state
        onChange({
          ...address,
          zipCode:      digits,
          street:       result.street,
          neighborhood: result.neighborhood,
          city:         result.city,
          state:        result.state,
        });
      }
    }
  };

  function set(field: keyof AddressDetail, value: string) {
    onClearError?.();
    onChange({ ...address, [field]: value });
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.sectionLabel}>
        Endereço <span className={styles.required}>obrigatório</span>
      </span>

      {addressError && (
        <span className={styles.addressError}>⚠ {addressError}</span>
      )}

      <div className={styles.addressGrid}>
        <Field label="CEP" error={cepError ?? undefined}>
          <div className={styles.cepWrap}>
            <Input
              placeholder="01310-100"
              value={address.zipCode.replace(/(\d{5})(\d)/, "$1-$2")}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={9}
            />
            {cepLoading && <span className={styles.cepSpinner} />}
          </div>
        </Field>

        <Field
          label="Número"
          error={addressError && !address.number.trim() ? " " : undefined}
        >
          <Input
            error={!!(addressError && !address.number.trim())}
            placeholder="123"
            value={address.number}
            onChange={(e) => set("number", e.target.value)}
          />
        </Field>

        {/* span2 → Field ocupa as 2 colunas (prop nativa do seu Field) */}
        <Field
          label="Rua"
          span2
          error={addressError && !address.street.trim() ? " " : undefined}
        >
          <Input
            error={!!(addressError && !address.street.trim())}
            placeholder="Rua das Flores"
            value={address.street}
            onChange={(e) => set("street", e.target.value)}
          />
        </Field>

        <Field label="Complemento">
          <Input
            placeholder="Apto 4"
            value={address.complement}
            onChange={(e) => set("complement", e.target.value)}
          />
        </Field>

        <Field label="Bairro">
          <Input
            placeholder="Centro"
            value={address.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
          />
        </Field>

        <Field label="Cidade">
          <Input
            placeholder="São Paulo"
            value={address.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>

        <Field label="Estado">
          <Input
            placeholder="SP"
            maxLength={2}
            value={address.state}
            onChange={(e) => set("state", e.target.value.toUpperCase())}
          />
        </Field>
      </div>
    </div>
  );
}