usage:
```yaml
      - name: test yaml
        id: myyaml
        uses: ./
        with:
          file: testfile.yaml
          directory: tests
          validate_keys: | # optional validation with Json path https://www.npmjs.com/package/jsonpath#user-content-jsonpath-syntax
            $..*.project_environment_name

      - name: print value
        run:
          echo "EXTRACTED ${{ fromJSON(steps.myyaml.outputs.content).development.project_environment_name }}"

      - name: print value
         run:
           echo "EXTRACTED ${{ fromJSON(steps.myyaml.outputs.content).service.port }}"

      - name: print array value
        run:
          echo "EXTRACTED ${{ fromJSON(steps.myyaml.outputs.content).jobs[2].name }}"
```
json path validation syntax [docs](https://www.npmjs.com/package/jsonpath#user-content-jsonpath-syntax)
